# PWA de inspecciones de laboratorio — proyecto base

Starter oficial para la materia **Aplicaciones Web Progresivas**.

Este repositorio es el punto de partida común para las actividades de las semanas 1–13. En la Semana 1 no debes construir todavía toda la PWA: debes poner en marcha este proyecto, documentar el problema y dejar una primera versión reproducible. Cada semana conservarás el mismo repositorio y agregarás la capacidad indicada por la actividad.

## Requisitos locales

- Node.js 20 LTS o superior compatible con Next.js.
- npm 10 o superior.
- Git y una cuenta de GitHub.

## Arranque verificable

```bash
npm ci
npm run dev
```

Abre <http://localhost:3000>. Debes ver la pantalla inicial de inspecciones con datos sintéticos.

Antes de entregar ejecuta:

```bash
make verify
bash public-tests/check.sh
```

`make verify` genera `reports/verification.json`; ese archivo y la corrida verde de GitHub Actions son la evidencia técnica del arranque.

## Flujo de trabajo del curso

1. Conserva este repositorio como tu proyecto personal y crea un repositorio privado en GitHub.
2. Completa únicamente los entregables de la actividad de la semana.
3. Haz cambios pequeños y descriptivos; no borres lo que ya funciona.
4. Ejecuta la verificación local y espera que GitHub Actions termine en verde.
5. Entrega en Classroom la URL del repositorio, el SHA exacto evaluado, el enlace a Actions y `evidence/individual.md`.

No uses datos reales de personas, laboratorios o estudiantes. Todo dato del starter es sintético.

## Estructura inicial

- `src/app/`: aplicación Next.js con App Router.
- `src/lib/data/`: datos sintéticos de inspecciones.
- `docs/`: plantillas de documentación de la Semana 1.
- `scripts/verify.mjs`: verificación reproducible local.
- `tests/`: prueba mínima del starter.

Las decisiones de arquitectura y las nuevas carpetas se incorporan en las actividades correspondientes; no es necesario adelantarlas.

# Semana 2

## Requisitos del entorno

Para ejecutar el proyecto localmente se requiere:

- Node.js 20 LTS o superior compatible con Next.js.
- npm 10 o superior.
- Git.
- Una cuenta de GitHub para el trabajo con el repositorio.

## versiones instaladas:

```bash
node --version
npm --version
git --version
```

## Instalación

Clonar el repositorio y acceder a la carpeta del proyecto:

`git clone https://github.com/karlabrojas/pwa-inspecciones-equipo-12.git`

`cd pwa-inspecciones-equipo-12`

Instalar las dependencias mediante:

`npm ci`

`npm ci` utiliza el `package-lock.json` para instalar las versiones exactas de las dependencias definidas para el proyecto.

## Configuración de Node.js

El proyecto utiliza:

- Node.js 20 LTS o superior.
- Next.js 14.2.35.
- React 18.3.1.
- npm 10 o superior.

No se requieren variables de entorno para ejecutar el starter en desarrollo.

## Ejecución local

Para iniciar el servidor de desarrollo:

`npm run dev`

Después, abrir:

`http://localhost:3000`

La aplicación muestra la pantalla inicial de inspecciones utilizando datos sintéticos.

## Verificación del proyecto

Las pruebas del proyecto pueden ejecutarse mediante:

`npm test`

Este comando ejecuta:

- La prueba mínima del starter.
- La prueba correspondiente al manifest de la PWA.

## Verificación estructural

El proyecto utiliza el siguiente comando:

`npm run verify`

También puede ejecutarse mediante:

`make verify`

make verify es equivalente a:

`npm run verify`

La verificación comprueba que los archivos y artefactos requeridos por el proyecto estén presentes y genera:

`reports/verification.json`

Un resultado exitoso muestra:

Starter verificable: `PASS`

## App Shell

El proyecto cuenta con un componente AppShell ubicado en:

`src/components/app-shell.tsx`

El App Shell representa la estructura básica y persistente de la aplicación. Actualmente incluye:

- Encabezado de la aplicación.
- Nombre de la aplicación.
- Navegación principal.
- Enlace para saltar directamente al contenido principal.
- Área principal donde se muestra el contenido.
- Pie de página.

La navegación contempla las secciones:

- Inicio.
- Inspecciones.
- Laboratorios.

El App Shell proporciona una estructura común para las diferentes vistas de la aplicación.

## Manifest de la PWA

La aplicación cuenta con el archivo:

`public/manifest.webmanifest`

El manifest define la identidad y el comportamiento de la aplicación cuando se instala como PWA.

Actualmente contiene:

- `name:` nombre completo de la aplicación.
- `short_name:` nombre corto utilizado en espacios reducidos.
- `start_url:` ruta desde la que inicia la aplicación.
- `scope:` rutas que pertenecen al alcance de la PWA.
- `display:` modo de visualización de la aplicación.
- `icons:` iconos utilizados por la aplicación.
- `theme_color:` color principal de la aplicación.
- `background_color:` color de fondo.
- `lang:` idioma de la aplicación.

Los iconos utilizados son:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

El manifest utiliza `display: standalone`, por lo que la aplicación puede presentarse con una experiencia similar a una aplicación independiente al ser instalada.

## Datos sintéticos

El proyecto utiliza exclusivamente datos sintéticos para las inspecciones.

Los datos de ejemplo incluyen información ficticia relacionada con:

- Técnicos.
- Laboratorios.
- Fechas.
- Descripciones.
- Hallazgos.
- Estados de inspección.

No se utilizan datos reales de personas, estudiantes, docentes, técnicos, laboratorios o instalaciones institucionales.

## Supuestos

Para esta etapa del proyecto se consideran los siguientes supuestos:

- El usuario dispone de Node.js y npm instalados.
- El proyecto se ejecuta inicialmente en un entorno local.
- Los datos utilizados durante el desarrollo son ficticios.
- La aplicación está orientada principalmente a técnicos de mantenimiento.
- La aplicación deberá evolucionar posteriormente hacia un funcionamiento offline-first.
- La conectividad puede ser intermitente durante las inspecciones.
- El almacenamiento local y la sincronización serán implementados en etapas posteriores.

## Limitaciones actuales

En esta etapa todavía no se encuentran implementadas todas las capacidades previstas para la PWA.

Entre las principales limitaciones se encuentran:

- No se ha implementado todavía el almacenamiento offline de inspecciones.
- No existe sincronización de datos con un servidor.
- No se ha implementado autenticación.
- No se han implementado notificaciones push.
- El proyecto utiliza datos sintéticos.
- La aplicación todavía se encuentra en desarrollo académico.

La funcionalidad offline y la sincronización corresponden a requisitos futuros del proyecto.

## Evidencia de verificación

La verificación local se realiza mediante:

```bash
npm ci
npm test
npm run verify
```

También puede utilizarse:

`make verify`

cuando make se encuentra disponible.

El comando equivalente cuando make no está disponible es:

`npm run verify`

La ejecución correcta de npm run verify genera:

`reports/verification.json`

con un estado de verificación exitoso.

## Seguridad y privacidad

El repositorio no debe contener:

- Contraseñas.
- Tokens.
- Claves privadas.
- Credenciales.
- Variables de entorno con información sensible.
- Datos personales reales.

Los datos utilizados en el proyecto son exclusivamente sintéticos.

## Estructura principal

```bash
.
├── docs/
│   ├── requirements.md
│   └── decision-record.md
├── evidence/
│   └── individual.md
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.webmanifest
├── scripts/
│   └── verify.mjs
├── src/
│   ├── app/
│   ├── components/
│   │   └── app-shell.tsx
│   └── lib/
│       └── data/
├── tests/
│   ├── starter.spec.mjs
│   └── manifest.spec.ts
├── package.json
└── package-lock.json
```

## Estado de la Semana 2

Durante la Semana 2 se documentó la configuración necesaria para ejecutar y verificar el proyecto, además de describir los componentes principales de la PWA.

Se documentaron:

- Requisitos del entorno.
- Instalación mediante npm ci.
- Ejecución local.
- Pruebas del proyecto.
- Verificación mediante npm run verify.
- Equivalencia con make verify.
- App Shell.
- Manifest de la PWA.
- Iconos de la aplicación.
- Supuestos.
- Limitaciones.
- Datos sintéticos.
- Seguridad y privacidad.
- Evidencia reproducible de verificación.

## 2. ¿Por qué esta versión cumple con los requisitos de la semana 2?

Porqué:

- `package.json` ya tiene `npm test` y `npm run verify`.
- `public/manifest.webmanifest` ya existe y define `name`, `short_name`, `start_url`, `scope`, `display` e iconos.
- `tests/manifest.spec.ts` ya existe y comprueba el manifest y los iconos.
- `scripts/verify.mjs` ya verifica `public/manifest.webmanifest`, `tests/manifest.spec.ts` y el resto de archivos requeridos.
- `Makefile` ya define `make verify` como equivalente de `npm run verify`.
- `AppShell` ya está implementado con navegación, contenido principal y footer.

# Semana 3 — Service Worker y funcionamiento offline

Durante la Semana 3 se incorporó el Service Worker de la PWA, su registro en el navegador, las estrategias de caché y las pruebas automatizadas para verificar el comportamiento online y offline.

## Service Worker

El Service Worker se encuentra en:

```text
public/sw.js
```

El Service Worker implementa los eventos principales:

- `install`
- `activate`
- `fetch`

Durante la instalación se precargan recursos estáticos definidos explícitamente.

Durante la activación se eliminan versiones antiguas de las cachés de la aplicación y se mantiene el control de los clientes mediante `self.clients.claim()`.

Las cachés utilizan versionado explícito para permitir la invalidación controlada de recursos.

## Registro del Service Worker

El registro se encuentra en:

```text
src/lib/pwa/register-service-worker.ts
```

El registro:

- Comprueba que la ejecución ocurra en el navegador.
- Comprueba que el navegador soporte Service Workers.
- Registra `/sw.js`.
- Espera al evento `load` cuando la página todavía no ha terminado de cargar.
- No bloquea la carga inicial de la aplicación.
- Registra errores en la consola.

El componente utilizado para iniciar el registro es:

```text
src/components/pwa-register.tsx
```

El registro se incorpora desde el layout principal de la aplicación.

## Estrategias de caché

La aplicación utiliza cuatro estrategias principales:

### Cache First

Se utiliza principalmente para recursos estáticos que pueden permanecer disponibles después de haber sido almacenados.

En particular, se utiliza para:

- iconos de la PWA;
- recursos estáticos de Next.js;
- otros recursos estáticos definidos por el Service Worker.

La caché se consulta antes de realizar una solicitud de red.

### Stale While Revalidate

Se utiliza para recursos que pueden responder rápidamente desde la caché mientras se obtiene una versión actualizada desde la red.

Actualmente se utiliza para:

```text
/manifest.webmanifest
```

### Network First

Intenta obtener primero una respuesta desde la red.

Si la red falla y existe una respuesta previamente almacenada, se utiliza la copia disponible en caché.

Esta estrategia se utiliza para:

```text
/api/inspections
```

También se utiliza para las navegaciones de la aplicación, permitiendo utilizar una copia disponible como respaldo cuando la conectividad falla.

### Network Only

La solicitud se realiza directamente a la red y no utiliza la caché como fuente de respuesta.

Se utiliza para solicitudes que no deben almacenarse y para solicitudes que no pertenecen a los recursos controlados por las estrategias de caché.

Las solicitudes `POST` y las solicitudes hacia otros orígenes no se almacenan en las cachés del Service Worker.

## Recursos precargados

Durante la instalación del Service Worker se precargan explícitamente:

```text
/
/manifest.webmanifest
/icons/icon-192.png
/icons/icon-512.png
```

Estos recursos permiten disponer de elementos básicos de la aplicación cuando no existe conectividad.

## Funcionamiento offline

La experiencia offline está limitada a los recursos que hayan sido precargados o almacenados mediante las estrategias de caché.

Cuando no existe conectividad:

- Los recursos estáticos previamente almacenados pueden utilizarse mediante **Cache First**.
- El manifest puede utilizarse desde la caché mediante **Stale While Revalidate**.
- Las navegaciones pueden utilizar una respuesta previamente almacenada mediante **Network First**.
- Los datos de inspecciones previamente almacenados pueden utilizarse como respaldo mediante **Network First**.
- Las solicitudes **Network Only** requieren conectividad.
- Una navegación sin conexión y sin recursos disponibles puede mostrar una respuesta de fallback con estado HTTP `503`.

El proyecto todavía no implementa una cola de operaciones `POST` para sincronización posterior. Por lo tanto, las operaciones de escritura sin conexión pueden fallar.

## Actualización e invalidación de caché

Las cachés utilizan una versión explícita:

```text
CACHE_VERSION
```

Se mantienen cachés separadas para recursos estáticos y recursos de ejecución.

Cuando se activa una nueva versión del Service Worker:

1. Se identifican las cachés antiguas de la aplicación.
2. Se eliminan las versiones que ya no corresponden a la versión actual.
3. Se conservan las cachés vigentes.
4. El nuevo Service Worker toma el control de los clientes mediante `self.clients.claim()`.

La eliminación de cachés se realiza durante `activate`, evitando eliminar la versión funcional antes de que el nuevo Service Worker haya sido instalado correctamente.

## Normalización de recursos estáticos

Los recursos estáticos de Next.js ubicados bajo:

```text
/_next/static/
```

utilizan una normalización de la clave de caché para evitar que parámetros de consulta como:

```text
?v=...
```

generen entradas innecesariamente diferentes para el mismo recurso estático.

## Seguridad y privacidad

El Service Worker evita almacenar indiscriminadamente todas las respuestas.

No deben almacenarse:

- Contraseñas.
- Tokens.
- Claves privadas.
- Credenciales.
- Información personal real.
- Datos reales de estudiantes.
- Información sensible.

El proyecto utiliza únicamente datos sintéticos.

Las solicitudes que no deben persistirse utilizan **Network Only**.

Las pruebas automatizadas también verifican que `public/sw.js` no contenga secretos ni tokens.

## Pruebas del Service Worker

Las pruebas principales se encuentran en:

```text
tests/service-worker.spec.ts
tests/service-worker-behavior.spec.ts
tests/offline.spec.ts
```

### Pruebas estructurales

`tests/service-worker.spec.ts` comprueba, entre otros aspectos:

- existencia del Service Worker;
- eventos `install`, `activate` y `fetch`;
- versionado de cachés;
- recursos precargados;
- cuatro estrategias de caché;
- `/api/inspections`;
- eliminación de cachés antiguas;
- control de clientes;
- recursos estáticos de Next.js;
- normalización de parámetros de consulta;
- registro del Service Worker;
- manejo de errores del registro.

### Pruebas de comportamiento

`tests/service-worker-behavior.spec.ts` verifica:

- precache durante `install`;
- eliminación controlada de cachés durante `activate`;
- comportamiento de solicitudes `POST`;
- comportamiento de solicitudes cross-origin;
- Cache First;
- Stale While Revalidate;
- protección ante respuestas HTTP `500`;
- ausencia de secretos o tokens.

### Pruebas offline

`tests/offline.spec.ts` verifica:

- navegación offline hacia la raíz;
- fallback para rutas no visitadas;
- fallback `503` cuando no existe caché;
- Network First con pérdida de conectividad;
- disponibilidad offline de iconos precargados;
- disponibilidad offline del manifest;
- disponibilidad offline de `/api/inspections` después de una consulta exitosa;
- regresión relacionada con respuestas `500`;
- comportamiento de recursos estáticos no almacenados;
- comportamiento de solicitudes `POST` sin conexión.

## Verificación de la Semana 3

La verificación completa puede ejecutarse mediante:

```bash
npm ci
npm test
make verify
npm run build
```

Cuando `make` no esté disponible:

```bash
npm ci
npm test
npm run verify
npm run build
```

El resultado de las pruebas debe finalizar sin errores.

La entrega también debe comprobar:

- `npm ci` exitoso;
- pruebas automatizadas exitosas;
- `make verify` exitoso o su equivalente documentado;
- build exitoso;
- GitHub Actions exitoso;
- ausencia de conflictos pendientes;
- ausencia de secretos, tokens o datos reales.

## Limitaciones actuales de la Semana 3

La implementación offline no representa una disponibilidad completa de toda la aplicación.

Actualmente:

- No existe una cola offline para operaciones `POST`.
- Las operaciones de escritura requieren conectividad.
- Los recursos que nunca fueron almacenados no pueden recuperarse sin conexión.
- La información disponible offline depende de las reglas explícitas del Service Worker.
- Los datos utilizados por el proyecto son sintéticos.
- La sincronización con un servidor todavía no está implementada.

## Documentación de la estrategia de caché

La descripción detallada de las estrategias utilizadas se encuentra en:

```text
docs/cache-strategy.md
```

La documentación debe mantenerse sincronizada con el comportamiento real de:

```text
public/sw.js
```

## Datos sintéticos

El proyecto utiliza exclusivamente datos sintéticos para las inspecciones.

Los datos de ejemplo incluyen información ficticia relacionada con:

- Técnicos.
- Laboratorios.
- Fechas.
- Descripciones.
- Hallazgos.
- Estados de inspección.

No se utilizan datos reales de personas, estudiantes, docentes, técnicos, laboratorios o instalaciones institucionales.

## Estructura principal

```text
.
├── docs/
│   ├── requirements.md
│   ├── decision-record.md
│   └── cache-strategy.md
├── evidence/
│   └── individual.md
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   └── verify.mjs
├── src/
│   ├── app/
│   ├── components/
│   │   ├── app-shell.tsx
│   │   └── pwa-register.tsx
│   └── lib/
│       ├── data/
│       └── pwa/
│           └── register-service-worker.ts
├── tests/
│   ├── starter.spec.mjs
│   ├── manifest.spec.ts
│   ├── service-worker.spec.ts
│   ├── service-worker-behavior.spec.ts
│   └── offline.spec.ts
├── package.json
├── package-lock.json
└── Makefile
```

## Estado de la Semana 3

La Semana 3 incorpora:

- Service Worker.
- Ciclo de vida `install`, `activate` y `fetch`.
- Precache de recursos definidos explícitamente.
- Cache First.
- Stale While Revalidate.
- Network First.
- Network Only.
- Versionado e invalidación controlada de cachés.
- Registro del Service Worker.
- Fallback para navegación sin conexión.
- Pruebas de comportamiento del Service Worker.
- Pruebas de funcionamiento offline.
- Verificación automatizada.
- Documentación de la estrategia de caché.

Las funcionalidades implementadas durante las semanas anteriores se conservan y forman parte de la integración actual del proyecto.

## Seguridad y privacidad

El repositorio no debe contener:

- Contraseñas.
- Tokens.
- Claves privadas.
- Credenciales.
- Variables de entorno con información sensible.
- Datos personales reales.

Los datos utilizados en el proyecto son exclusivamente sintéticos.

## ¿Por qué esta versión cumple con los requisitos de la semana 3?

Esta versión cumple con los requisitos de la Semana 3 porque incorpora y documenta las funcionalidades necesarias para implementar el Service Worker, las estrategias de caché y el funcionamiento offline de la PWA.

- `public/sw.js` implementa el ciclo de vida del Service Worker mediante los eventos `install`, `activate` y `fetch`.
- Se utiliza versionado explícito de las cachés mediante `CACHE_VERSION`.
- Durante la instalación se precargan recursos básicos de la aplicación mediante `PRECACHE_URLS`.
- Se implementan las cuatro estrategias de caché definidas para el proyecto:
  - **Cache First** para recursos estáticos.
  - **Stale While Revalidate** para el manifest.
  - **Network First** para las navegaciones y los datos sintéticos de inspecciones.
  - **Network Only** para solicitudes que no deben persistirse.

- Se implementa la eliminación controlada de cachés antiguas durante `activate`.
- Se incorpora un fallback para las navegaciones cuando no existe conectividad.
- El registro del Service Worker se encuentra separado en `src/lib/pwa/register-service-worker.ts` y se realiza sin bloquear la carga inicial de la aplicación.
- La estrategia de caché utilizada está documentada en `docs/cache-strategy.md` y corresponde al comportamiento implementado en `public/sw.js`.
- Existen pruebas automatizadas para validar el comportamiento del Service Worker mediante `tests/service-worker.spec.ts` y `tests/service-worker-behavior.spec.ts`.
- Existen pruebas específicas para pérdida de conectividad y funcionamiento offline mediante `tests/offline.spec.ts`.
- Las pruebas incluyen casos de regresión, fallback offline, recursos precargados, solicitudes `POST`, solicitudes cross-origin y respuestas de error.
- `npm test` ejecuta las pruebas del starter, manifest, Service Worker y funcionamiento offline.
- La verificación reproducible puede ejecutarse mediante `make verify` o su equivalente `npm run verify`.
- El proyecto utiliza únicamente datos sintéticos y no almacena indiscriminadamente información sensible, credenciales o tokens.
- `evidence/individual.md` proporciona la estructura necesaria para registrar las contribuciones, commits, decisiones técnicas, pruebas y validaciones de cada integrante.

Por lo anterior, la versión integra las contribuciones de los tres integrantes y mantiene las funcionalidades implementadas durante las semanas anteriores, incorporando las capacidades de Service Worker, caché, recuperación ante pérdida de conectividad y pruebas automatizadas requeridas para la Semana 3.
