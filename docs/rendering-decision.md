# Decision de renderizado: CSR vs SSR en el dominio de inspecciones

## Contexto

El proyecto usa Next.js 14 (App Router). Las dos rutas relevantes son:

- `/` (listado de inspecciones) - `src/app/page.tsx`
- `/inspecciones/[id]` (detalle de una inspeccion) - `src/app/inspecciones/[id]/page.tsx`

Ambas paginas estan marcadas como Client Components (`"use client"`) e
implementan sus propios estados de interfaz (`loading`, `error`, `empty`/`not-found`,
`normal`) mediante `useState`/`useEffect` con retardos simulados (`setTimeout`),
sobre datos 100% sinteticos definidos en `src/lib/data/inspections.ts`.

Un detalle importante confirmado con `npm run build`: aunque ambas paginas son
Client Components, Next.js igual genera su HTML en el servidor antes de
enviarlo al navegador:


Es decir: el proyecto **no usa CSR puro** (no es un SPA sin HTML inicial). Usa
el modelo hibrido de Next.js: HTML generado en el servidor (SSG para `/`,
SSR por request para `/inspecciones/[id]`) + hidratacion en el cliente, y a
partir de ahi toda la logica de estados (loading/error/detalle) ocurre en el
cliente con JavaScript.

## Comparacion CSR vs SSR en este dominio

| Aspecto | CSR (cliente renderiza todo) | SSR (servidor renderiza HTML) | Lo que usa este proyecto |
|---|---|---|---|
| HTML inicial | Vacio o "shell"; contenido aparece tras ejecutar JS | HTML completo desde el primer response | HTML con el "shell" del estado inicial (loading), generado por el servidor |
| Dependencia de red por navegacion | Ninguna si los assets ya estan cacheados (bueno para conectividad intermitente) | Cada navegacion normalmente requiere ida y vuelta al servidor | El SW ya intercepta navegaciones con Network First + fallback offline (ver docs/cache-strategy.md); el listado ademas es 100% estatico (prerenderizado en build, sin llamar servidor en cada visita) |
| Interactividad (botones de estado, "Simular error") | Nativa: el estado vive en el cliente | Requiere hidratacion o revalidacion para actualizar UI | Se necesita el cliente si o si, porque los controles de demostracion (cambiar de estado, simular error) son interaccion pura de UI |
| Complejidad de implementacion | Baja con datos sinteticos en memoria; no requiere data-fetching en servidor | Requiere logica de fetch en servidor (route handlers, `fetch` con cache tags, etc.) | Baja: no se agrego logica de servidor nueva; los datos siguen siendo un arreglo en memoria importado directamente |
| Rendimiento offline | Bueno si los recursos estan precacheados (que es el caso, ver Service Worker) | Depende de que el servidor este disponible en cada navegacion, lo cual choca con "conectividad intermitente" | Favorece CSR con Service Worker: la navegacion ya cae al fallback offline documentado en `docs/cache-strategy.md` |

## Decision tecnica

**Se mantienen ambas rutas como Client Components (CSR con pre-render inicial
de Next.js), y no se migran a Server Components / fetching en servidor.**

Razones:

1. **Conectividad intermitente es la restriccion central del proyecto**
   (ver `docs/decision-record.md`, ADR-001). Un modelo que dependiera de que
   el servidor responda en cada navegacion es mas fragil ante esa restriccion
   que un modelo donde el Service Worker puede servir HTML/JS ya cacheado y
   la logica de datos corre en el cliente.
2. La listado (`/`) ya se beneficia de SSG (prerenderizado en build, â—‹), que
   es la variante de "renderizado en servidor" mas barata posible: no hay
   servidor que consultar en cada visita, solo archivos estaticos servibles
   incluso por el Service Worker via Cache First/Network First.
3. Los datos son sinteticos y estan en memoria (`src/lib/data/inspections.ts`);
   no existe una razon de negocio para mover ese arreglo a un data-fetch de
   servidor en esta etapa del proyecto (14 semanas de alcance).
4. La interactividad requerida (cambiar entre estados de demostracion, boton
   "Simular error", boton "Mostrar/Ocultar resumen") es inherentemente de
   cliente; convertir las paginas a Server Components obligaria a mover esa
   logica a un componente cliente aparte de todas formas, agregando
   complejidad sin beneficio claro para el alcance actual.

## Trade-offs

- **A favor de la decision:** menor complejidad (no hay route handlers ni
  revalidacion de cache de datos que mantener), compatibilidad directa con
  la estrategia offline-first ya implementada (Semana 3), y el listado ya
  tiene el mejor caso posible de carga inicial (estatico).
- **En contra / costo asumido:** el detalle (`/inspecciones/[id]`) es
  dinamico por request (Æ’), lo que significa que sin Service Worker activo
  (primera visita) depende de que el servidor responda; y el "First Load JS"
  (87.2 kB compartido + 1.4-1.7 kB por ruta) se descarga siempre, incluso
  aunque el contenido pudiera haberse mostrado sin JS en un modelo SSR puro
  sin hidratacion.
- Si en el futuro el proyecto reemplaza los datos sinteticos por un backend
  real, esta decision deberia revisarse: en ese escenario, Server Components
  con fetch en servidor podrian reducir el JS enviado al cliente para el
  listado inicial.

## Impacto esperado/observado en la carga

Metrica utilizada: **First Load JS** reportado por `next build` (tabla de
rutas), complementado con el tamano de pagina individual.

Resultado observado (ver "Procedimiento reproducible" abajo para repetirlo):

- `/` (listado): 1.45 kB de pagina, **88.7 kB** First Load JS. Estatica.
- `/inspecciones/[id]` (detalle): 1.69 kB de pagina, **88.9 kB** First Load JS. Dinamica.
- JS compartido entre todas las rutas: 87.2 kB.

Interpretacion: el costo de JS es practicamente el mismo entre listado y
detalle (la diferencia es de ~0.2 kB), porque ambas dependen del mismo
runtime compartido de React/Next. El "loading" simulado con `setTimeout`
(800ms en el listado, 500ms en el detalle) es un retardo artificial de
demostracion, no una medicion real de red; se documenta como tal en
"Supuestos" mas abajo.

## Accesibilidad

- Los estados de carga y error usan `role="status"` / `role="alert"` y
  `aria-live="polite"` (ver `src/components/loading-state.tsx` y
  `src/app/page.tsx`), para que lectores de pantalla anuncien los cambios
  de estado sin depender de percepcion visual.
- El boton "Mostrar/Ocultar resumen" en el detalle usa `aria-expanded` para
  comunicar su estado.
- Al ser renderizado en cliente, estos anuncios dependen de que el JS se
  haya hidratado; en una perdida de conexion durante la hidratacion inicial
  (antes de que el Service Worker tome control), la accesibilidad de estos
  estados podria degradarse. No se ha medido este caso especifico con
  lectores de pantalla reales (ver Limites).

## Complejidad

Baja. No se introdujo:
- Logica de data-fetching en servidor (route handlers, `fetch` con opciones
  de cache de Next.js).
- Revalidacion incremental (`revalidate`, `ISR`).
- Streaming SSR / `Suspense` con datos asincronos del servidor.

La unica pieza nueva de logica extraida para este issue es
`src/lib/data/inspection-view.ts`, que replica (para fines de prueba) la
logica de busqueda/carga que ya usan `page.tsx` y `[id]/page.tsx`.

## Limites

- Las pruebas automatizadas de este issue (`tests/rendering.spec.ts`) no
  renderizan JSX real: el proyecto no tiene instalado jsdom, Testing Library
  ni Playwright. Las pruebas ejercitan la logica de datos/carga extraida en
  `src/lib/data/inspection-view.ts`, que refleja el comportamiento de las
  paginas pero no reemplaza una prueba visual/DOM real.
- El retardo de "loading" (500ms/800ms) es fijo y simulado en el codigo, no
  una medicion de una peticion de red real, porque no existe backend: los
  datos son un arreglo en memoria.
- El First Load JS reportado por `next build` es una metrica de tamano de
  bundle, no una medicion de tiempo real en un dispositivo/red concretos
  (no se ejecuto Lighthouse ni un profiling de red en este issue).

## Riesgos

- Si el equipo agrega mas dependencias de cliente (por ejemplo, una libreria
  de UI pesada), el First Load JS compartido (87.2 kB) crecera y afectara
  ambas rutas por igual, ya que comparten el mismo runtime.
- El detalle es dinamico por request (Æ’); si el servidor no esta disponible
  en la primera visita (antes de que el Service Worker haya precacheado
  nada), la navegacion dependera del fallback offline documentado en
  `docs/cache-strategy.md` (respuesta 503 "Sin conexion" si no hay nada en
  cache).

## Supuestos

- Se asume que el volumen de datos sinteticos seguira siendo pequeno
  (arreglo en memoria) durante el alcance de 14 semanas del proyecto; si
  esto cambia, la decision de mantener CSR/Client Components deberia
  revisarse.
- Se asume Node.js 22.x y Next.js 14.2.35 como entorno de referencia (las
  metricas de First Load JS pueden variar entre versiones).
- Se asume que los criterios de "loading"/"error" que pide el issue se
  refieren a los estados de interfaz ya implementados (spinner, mensaje de
  error, id inexistente), y no a un estado de carga de red real medido con
  herramientas de profiling.

## Metrica de carga utilizada y procedimiento reproducible

**Metrica:** First Load JS por ruta, tal como la reporta el propio
compilador de Next.js (`next build`). Se eligio esta metrica porque:

1. No requiere instalar herramientas adicionales (Lighthouse, Playwright).
2. Es determinista: el mismo codigo produce el mismo tamano de bundle.
3. Se genera automaticamente en cada build, incluyendo en CI.

**Procedimiento para reproducirla:**

```bash
npm ci
npm run build
```

El resultado aparece en la salida estandar, en la tabla bajo el encabezado
`Route (app)`, columna `First Load JS`. Ese mismo build tambien queda
disponible en `.next/` para inspeccion adicional si se requiere.

Para complementar esta metrica con una medicion de experiencia real en
navegador (no incluida en este issue por no requerir herramientas nuevas),
se recomienda como trabajo futuro ejecutar Lighthouse (Chrome DevTools >
pestana Lighthouse > Performance) sobre `npm run build && npm run start`.