# Decision de renderizado: CSR vs SSR en el dominio de inspecciones

## Contexto

El proyecto usa Next.js 14 (App Router). Las dos rutas relevantes son:

- `/inspecciones` (listado de inspecciones) - `src/app/inspecciones/page.tsx`
- `/inspecciones/[id]` (detalle de una inspeccion) - `src/app/inspecciones/[id]/page.tsx`

## Lo que implementa cada ruta

### Listado (`/inspecciones`) - SSR real

`src/app/inspecciones/page.tsx` no tiene la directiva `"use client"`: es un
Server Component. Ademas declara:

```ts
export const dynamic = "force-dynamic";
```

Esto le indica a Next.js que la ruta no debe prerenderizarse como pagina
estatica (SSG) sino renderizarse en el servidor en cada solicitud (SSR real
por request). Los datos se leen de forma sincrona desde
`src/lib/data/inspections.ts` (arreglo en memoria) al momento de construir el
HTML en el servidor.

La carpeta tambien incluye, siguiendo la convencion de Next.js App Router:

- `loading.tsx`: UI que Next.js muestra automaticamente mientras `page.tsx`
  esta resolviendo sus datos.
- `error.tsx`: boundary de error (debe ser Client Component por requisito de
  Next.js) que Next.js muestra automaticamente si `page.tsx` lanza una
  excepcion durante el render en el servidor.

### Detalle (`/inspecciones/[id]`) - CSR

`src/app/inspecciones/[id]/page.tsx` si tiene `"use client"`: es un Client
Component. Usa `useState`/`useEffect` con un `setTimeout` para simular una
carga asincrona, y maneja en el cliente los estados `loading`, `error` (boton
"Simular error") y "no encontrado" (id inexistente).

## Comparacion CSR vs SSR en este dominio

| Aspecto | CSR (cliente renderiza) | SSR (servidor renderiza) | Ruta que lo usa aqui |
|---|---|---|---|
| Donde corre la logica de datos | En el navegador, tras hidratar | En el servidor, antes de enviar el HTML | Listado: SSR. Detalle: CSR |
| Estados de carga/error | Se controlan con estado de React (`useState`) | Se controlan con `loading.tsx`/`error.tsx` de Next.js | Listado usa las convenciones de Next.js; detalle usa estado de React |
| Dependencia de red por navegacion | Ninguna si el JS ya esta cacheado | Requiere que el servidor responda en cada solicitud (agravado por `force-dynamic`) | El listado SSR es mas sensible a la conectividad intermitente que el detalle CSR una vez cacheado por el Service Worker |
| Interactividad | Nativa | Requiere Client Component aparte para cualquier interaccion | El detalle necesita CSR porque tiene botones de interaccion (mostrar/ocultar resumen, simular error) |
| Complejidad | Baja con datos en memoria | Requiere pensar en el ciclo de vida servidor (`dynamic`, `loading.tsx`, `error.tsx`) | El listado asume mas complejidad de configuracion de Next.js a cambio de HTML ya resuelto en el primer response |

## Decision tecnica

El equipo implemento una division deliberada: el listado usa SSR real
(`force-dynamic`) y el detalle usa CSR, en lugar de que ambas rutas usen la
misma estrategia. Razones:

1. El listado es la pagina de entrada mas visitada; renderizarla en el
   servidor entrega HTML con contenido ya resuelto en el primer response, sin
   esperar a que el JS del cliente se hidrate.
2. El detalle necesita interaccion pura de cliente (mostrar/ocultar resumen,
   boton de simular error para pruebas de UI), lo cual es mas simple de
   implementar como Client Component.
3. Esto permite comparar en un mismo proyecto ambas estrategias con datos
   sinteticos identicos, que es el proposito explicito de la actividad
   (Semana 4: "Implementar y comparar rutas CSR y SSR para listado y
   detalle").

## Trade-offs

- A favor de SSR en el listado: el HTML ya contiene los datos al llegar al
  navegador; no depende de que el JS del cliente se ejecute para mostrar
  contenido.
- En contra de SSR en el listado: `force-dynamic` deshabilita la posibilidad
  de servir el listado como pagina estatica; cada visita requiere que el
  servidor este disponible y ejecute el render, lo cual es mas fragil ante la
  conectividad intermitente que es la restriccion central del proyecto (ver
  `docs/decision-record.md`, ADR-001), salvo que el Service Worker ya tenga
  una copia cacheada de una visita anterior (estrategia Network First
  documentada en `docs/cache-strategy.md`).
- A favor de CSR en el detalle: la interaccion (mostrar/ocultar resumen,
  simular error) es simple de implementar con estado de React, sin logica de
  servidor adicional.
- En contra de CSR en el detalle: el contenido no esta disponible hasta que
  el JS se ejecuta y la promesa simulada se resuelve (500ms).

## Impacto esperado/observado en la carga

Metrica utilizada: First Load JS reportado por `next build` (tabla de
rutas).

Resultado obtenido en una ejecucion reciente de `npm run build`:

- `/inspecciones`: Size 140 B, First Load JS **87.4 kB** (Dynamic, SSR real)
- `/inspecciones/[id]`: Size 2.7 kB, First Load JS **89.9 kB** (Dynamic, CSR)
- JS compartido entre todas las rutas: 87.2 kB

Interpretacion: el listado SSR tiene el First Load JS mas bajo de las dos
rutas (87.4 kB, practicamente solo el runtime compartido), porque al ser un
Server Component no envia al cliente la logica de estados que si necesita el
detalle CSR (2.7 kB adicionales de componente propio). Esto es evidencia
directa de que, en este proyecto, SSR reduce el JavaScript enviado al
navegador respecto a CSR para una pagina equivalente.

## Accesibilidad

- El estado de carga del listado (`src/app/inspecciones/loading.tsx`) usa
  `role="status"` y `aria-live="polite"`.
- El estado de error del listado (`src/app/inspecciones/error.tsx`) no
  declara `role="alert"` actualmente; se documenta como limite a corregir.
- El detalle usa `role="status"`/`role="alert"` (via
  `src/components/loading-state.tsx`) y `aria-expanded` en el boton de
  resumen.

## Complejidad

- El listado SSR requiere entender tres archivos coordinados por convencion
  de carpeta (`page.tsx`, `loading.tsx`, `error.tsx`) y la directiva
  `dynamic = "force-dynamic"`.
- El detalle CSR concentra toda la logica de estados en un solo componente
  cliente con `useState`/`useEffect`.

## Limites

- `page.tsx` del listado lee los datos de forma sincrona (sin `await` ni
  delay simulado) y no lanza ninguna excepcion en su logica actual. Esto
  significa que, en la practica, `loading.tsx` casi nunca llega a mostrarse
  (el render del servidor es practicamente instantaneo) y `error.tsx` no
  tiene ningun disparador real en el codigo actual: existen porque siguen la
  convencion de Next.js, pero no estan siendo ejercitados por una condicion
  de carga lenta o de fallo real todavia.
- Las pruebas automatizadas de `tests/rendering.spec.ts` ejercitan la logica
  de `src/lib/data/inspection-view.ts` (un modulo con `loadInspectionsList`,
  `findInspectionById`, etc., creado para permitir pruebas deterministas sin
  jsdom/Playwright). Ese modulo no esta importado actualmente por
  `src/app/inspecciones/page.tsx` (que usa datos sincronos directos), asi que
  esas pruebas validan un comportamiento equivalente/de referencia, no la
  ejecucion linea por linea del Server Component real. Para cerrar esa
  brecha, se agregaron pruebas estructurales que verifican directamente el
  codigo fuente (`"use client"`, `dynamic = "force-dynamic"`).
- No se ejecuto Lighthouse ni profiling de red real; el First Load JS es una
  metrica de tamano de bundle, no de tiempo real en un dispositivo concreto.

## Riesgos

- Si el listado (SSR, `force-dynamic`) no logra cachearse por el Service
  Worker antes de perder la conexion, la navegacion dependera del fallback
  offline documentado en `docs/cache-strategy.md` (503 "Sin conexion").
- Al no existir un disparador real de error en el listado, un fallo real de
  datos en el futuro (por ejemplo, si se conecta a un backend real) podria
  no estar cubierto por una prueba que lo reproduzca, hasta que se agregue
  logica de manejo de errores real a `page.tsx`.

## Supuestos

- Se asume que el volumen de datos sinteticos seguira siendo pequeno
  (arreglo en memoria) durante el alcance de 14 semanas del proyecto.
- Se asume Node.js 22.x y Next.js 14.2.35 como entorno de referencia.
- Se asume que el proposito de comparar CSR y SSR en esta actividad se
  cumple mostrando ambas estrategias implementadas con datos sinteticos
  identicos, no necesariamente con metricas de produccion.

## Metrica de carga utilizada y procedimiento reproducible

Metrica: First Load JS por ruta, reportada por `next build`.

Procedimiento:

```bash
npm ci
npm run build
```

El resultado aparece en la tabla `Route (app)`, columna `First Load JS`, para
las rutas `/inspecciones` y `/inspecciones/[id]`.