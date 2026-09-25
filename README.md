# PWA de inspecciones de laboratorio â€” proyecto base

Starter oficial para la materia **Aplicaciones Web Progresivas**.

Este repositorio es el punto de partida comÃºn para las actividades de las semanas 1â€“13. En la Semana 1 no debes construir todavÃ­a toda la PWA: debes poner en marcha este proyecto, documentar el problema y dejar una primera versiÃ³n reproducible. Cada semana conservarÃ¡s el mismo repositorio y agregarÃ¡s la capacidad indicada por la actividad.

## Requisitos locales

- Node.js 20 LTS o superior compatible con Next.js.
- npm 10 o superior.
- Git y una cuenta de GitHub.

## Arranque verificable

```bash
npm ci
npm run dev
```

Abre <http://localhost:3000>. Debes ver la pantalla inicial de inspecciones con datos sintÃ©ticos.

Antes de entregar ejecuta:

```bash
make verify
bash public-tests/check.sh
```

`make verify` genera `reports/verification.json`; ese archivo y la corrida verde de GitHub Actions son la evidencia tÃ©cnica del arranque.

## Flujo de trabajo del curso

1. Conserva este repositorio como tu proyecto personal y crea un repositorio privado en GitHub.
2. Completa Ãºnicamente los entregables de la actividad de la semana.
3. Haz cambios pequeÃ±os y descriptivos; no borres lo que ya funciona.
4. Ejecuta la verificaciÃ³n local y espera que GitHub Actions termine en verde.
5. Entrega en Classroom la URL del repositorio, el SHA exacto evaluado, el enlace a Actions y `evidence/individual.md`.

No uses datos reales de personas, laboratorios o estudiantes. Todo dato del starter es sintÃ©tico.

## Estructura inicial

- `src/app/`: aplicaciÃ³n Next.js con App Router.
- `src/lib/data/`: datos sintÃ©ticos de inspecciones.
- `docs/`: plantillas de documentaciÃ³n de la Semana 1.
- `scripts/verify.mjs`: verificaciÃ³n reproducible local.
- `tests/`: prueba mÃ­nima del starter.

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

## InstalaciÃ³n

Clonar el repositorio y acceder a la carpeta del proyecto:

`git clone https://github.com/karlabrojas/pwa-inspecciones-equipo-12.git`

`cd pwa-inspecciones-equipo-12`

Instalar las dependencias mediante:

`npm ci`

`npm ci` utiliza el `package-lock.json` para instalar las versiones exactas de las dependencias definidas para el proyecto.

## ConfiguraciÃ³n de Node.js

El proyecto utiliza:

- Node.js 20 LTS o superior.
- Next.js 14.2.35.
- React 18.3.1.
- npm 10 o superior.

No se requieren variables de entorno para ejecutar el starter en desarrollo.

## EjecuciÃ³n local

Para iniciar el servidor de desarrollo:

`npm run dev`

DespuÃ©s, abrir:

`http://localhost:3000`

La aplicaciÃ³n muestra la pantalla inicial de inspecciones utilizando datos sintÃ©ticos.

## VerificaciÃ³n del proyecto

Las pruebas del proyecto pueden ejecutarse mediante:

`npm test`

Este comando ejecuta:

- La prueba mÃ­nima del starter.
- La prueba correspondiente al manifest de la PWA.

## VerificaciÃ³n estructural

El proyecto utiliza el siguiente comando:

`npm run verify`

TambiÃ©n puede ejecutarse mediante:

`make verify`

make verify es equivalente a:

`npm run verify`

La verificaciÃ³n comprueba que los archivos y artefactos requeridos por el proyecto estÃ©n presentes y genera:

`reports/verification.json`

Un resultado exitoso muestra:

Starter verificable: `PASS`

## App Shell

El proyecto cuenta con un componente AppShell ubicado en:

`src/components/app-shell.tsx`

El App Shell representa la estructura bÃ¡sica y persistente de la aplicaciÃ³n. Actualmente incluye:

- Encabezado de la aplicaciÃ³n.
- Nombre de la aplicaciÃ³n.
- NavegaciÃ³n principal.
- Enlace para saltar directamente al contenido principal.
- Ãrea principal donde se muestra el contenido.
- Pie de pÃ¡gina.

La navegaciÃ³n contempla las secciones:

- Inicio.
- Inspecciones.
- Laboratorios.

El App Shell proporciona una estructura comÃºn para las diferentes vistas de la aplicaciÃ³n.

## Manifest de la PWA

La aplicaciÃ³n cuenta con el archivo:

`public/manifest.webmanifest`

El manifest define la identidad y el comportamiento de la aplicaciÃ³n cuando se instala como PWA.

Actualmente contiene:

- `name:` nombre completo de la aplicaciÃ³n.
- `short_name:` nombre corto utilizado en espacios reducidos.
- `start_url:` ruta desde la que inicia la aplicaciÃ³n.
- `scope:` rutas que pertenecen al alcance de la PWA.
- `display:` modo de visualizaciÃ³n de la aplicaciÃ³n.
- `icons:` iconos utilizados por la aplicaciÃ³n.
- `theme_color:` color principal de la aplicaciÃ³n.
- `background_color:` color de fondo.
- `lang:` idioma de la aplicaciÃ³n.

Los iconos utilizados son:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

El manifest utiliza `display: standalone`, por lo que la aplicaciÃ³n puede presentarse con una experiencia similar a una aplicaciÃ³n independiente al ser instalada.

## Datos sintÃ©ticos

El proyecto utiliza exclusivamente datos sintÃ©ticos para las inspecciones.

Los datos de ejemplo incluyen informaciÃ³n ficticia relacionada con:

- TÃ©cnicos.
- Laboratorios.
- Fechas.
- Descripciones.
- Hallazgos.
- Estados de inspecciÃ³n.

No se utilizan datos reales de personas, estudiantes, docentes, tÃ©cnicos, laboratorios o instalaciones institucionales.

## Supuestos

Para esta etapa del proyecto se consideran los siguientes supuestos:

- El usuario dispone de Node.js y npm instalados.
- El proyecto se ejecuta inicialmente en un entorno local.
- Los datos utilizados durante el desarrollo son ficticios.
- La aplicaciÃ³n estÃ¡ orientada principalmente a tÃ©cnicos de mantenimiento.
- La aplicaciÃ³n deberÃ¡ evolucionar posteriormente hacia un funcionamiento offline-first.
- La conectividad puede ser intermitente durante las inspecciones.
- El almacenamiento local y la sincronizaciÃ³n serÃ¡n implementados en etapas posteriores.

## Limitaciones actuales

En esta etapa todavÃ­a no se encuentran implementadas todas las capacidades previstas para la PWA.

Entre las principales limitaciones se encuentran:

- No se ha implementado todavÃ­a el almacenamiento offline de inspecciones.
- No existe sincronizaciÃ³n de datos con un servidor.
- No se ha implementado autenticaciÃ³n.
- No se han implementado notificaciones push.
- El proyecto utiliza datos sintÃ©ticos.
- La aplicaciÃ³n todavÃ­a se encuentra en desarrollo acadÃ©mico.

La funcionalidad offline y la sincronizaciÃ³n corresponden a requisitos futuros del proyecto.

## Evidencia de verificaciÃ³n

La verificaciÃ³n local se realiza mediante:

```bash
npm ci
npm test
npm run verify
```

TambiÃ©n puede utilizarse:

`make verify`

cuando make se encuentra disponible.

El comando equivalente cuando make no estÃ¡ disponible es:

`npm run verify`

La ejecuciÃ³n correcta de npm run verify genera:

`reports/verification.json`

con un estado de verificaciÃ³n exitoso.

## Seguridad y privacidad

El repositorio no debe contener:

- ContraseÃ±as.
- Tokens.
- Claves privadas.
- Credenciales.
- Variables de entorno con informaciÃ³n sensible.
- Datos personales reales.

Los datos utilizados en el proyecto son exclusivamente sintÃ©ticos.

## Estructura principal

```bash
.
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ requirements.md
â”‚   â””â”€â”€ decision-record.md
â”œâ”€â”€ evidence/
â”‚   â””â”€â”€ individual.md
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ icons/
â”‚   â”‚   â”œâ”€â”€ icon-192.png
â”‚   â”‚   â””â”€â”€ icon-512.png
â”‚   â””â”€â”€ manifest.webmanifest
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ verify.mjs
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â””â”€â”€ app-shell.tsx
â”‚   â””â”€â”€ lib/
â”‚       â””â”€â”€ data/
â”œâ”€â”€ tests/
â”‚   â”œâ”€â”€ starter.spec.mjs
â”‚   â””â”€â”€ manifest.spec.ts
â”œâ”€â”€ package.json
â””â”€â”€ package-lock.json
```

## Estado de la Semana 2

Durante la Semana 2 se documentÃ³ la configuraciÃ³n necesaria para ejecutar y verificar el proyecto, ademÃ¡s de describir los componentes principales de la PWA.

Se documentaron:

- Requisitos del entorno.
- InstalaciÃ³n mediante npm ci.
- EjecuciÃ³n local.
- Pruebas del proyecto.
- VerificaciÃ³n mediante npm run verify.
- Equivalencia con make verify.
- App Shell.
- Manifest de la PWA.
- Iconos de la aplicaciÃ³n.
- Supuestos.
- Limitaciones.
- Datos sintÃ©ticos.
- Seguridad y privacidad.
- Evidencia reproducible de verificaciÃ³n.

## 2. Â¿Por quÃ© esta versiÃ³n cumple con los requisitos de la semana 2?

PorquÃ©:

- `package.json` ya tiene `npm test` y `npm run verify`.
- `public/manifest.webmanifest` ya existe y define `name`, `short_name`, `start_url`, `scope`, `display` e iconos.
- `tests/manifest.spec.ts` ya existe y comprueba el manifest y los iconos.
- `scripts/verify.mjs` ya verifica `public/manifest.webmanifest`, `tests/manifest.spec.ts` y el resto de archivos requeridos.
- `Makefile` ya define `make verify` como equivalente de `npm run verify`.
- `AppShell` ya estÃ¡ implementado con navegaciÃ³n, contenido principal y footer.

# Semana 3 â€” Service Worker y funcionamiento offline

Durante la Semana 3 se incorporÃ³ el Service Worker de la PWA, su registro en el navegador, las estrategias de cachÃ© y las pruebas automatizadas para verificar el comportamiento online y offline.

## Service Worker

El Service Worker se encuentra en:

```text
public/sw.js
```

El Service Worker implementa los eventos principales:

- `install`
- `activate`
- `fetch`

Durante la instalaciÃ³n se precargan recursos estÃ¡ticos definidos explÃ­citamente.

Durante la activaciÃ³n se eliminan versiones antiguas de las cachÃ©s de la aplicaciÃ³n y se mantiene el control de los clientes mediante `self.clients.claim()`.

Las cachÃ©s utilizan versionado explÃ­cito para permitir la invalidaciÃ³n controlada de recursos.

## Registro del Service Worker

El registro se encuentra en:

```text
src/lib/pwa/register-service-worker.ts
```

El registro:

- Comprueba que la ejecuciÃ³n ocurra en el navegador.
- Comprueba que el navegador soporte Service Workers.
- Registra `/sw.js`.
- Espera al evento `load` cuando la pÃ¡gina todavÃ­a no ha terminado de cargar.
- No bloquea la carga inicial de la aplicaciÃ³n.
- Registra errores en la consola.

El componente utilizado para iniciar el registro es:

```text
src/components/pwa-register.tsx
```

El registro se incorpora desde el layout principal de la aplicaciÃ³n.

## Estrategias de cachÃ©

La aplicaciÃ³n utiliza cuatro estrategias principales:

### Cache First

Se utiliza principalmente para recursos estÃ¡ticos que pueden permanecer disponibles despuÃ©s de haber sido almacenados.

En particular, se utiliza para:

- iconos de la PWA;
- recursos estÃ¡ticos de Next.js;
- otros recursos estÃ¡ticos definidos por el Service Worker.

La cachÃ© se consulta antes de realizar una solicitud de red.

### Stale While Revalidate

Se utiliza para recursos que pueden responder rÃ¡pidamente desde la cachÃ© mientras se obtiene una versiÃ³n actualizada desde la red.

Actualmente se utiliza para:

```text
/manifest.webmanifest
```

### Network First

Intenta obtener primero una respuesta desde la red.

Si la red falla y existe una respuesta previamente almacenada, se utiliza la copia disponible en cachÃ©.

Esta estrategia se utiliza para:

```text
/api/inspections
```

TambiÃ©n se utiliza para las navegaciones de la aplicaciÃ³n, permitiendo utilizar una copia disponible como respaldo cuando la conectividad falla.

### Network Only

La solicitud se realiza directamente a la red y no utiliza la cachÃ© como fuente de respuesta.

Se utiliza para solicitudes que no deben almacenarse y para solicitudes que no pertenecen a los recursos controlados por las estrategias de cachÃ©.

Las solicitudes `POST` y las solicitudes hacia otros orÃ­genes no se almacenan en las cachÃ©s del Service Worker.

## Recursos precargados

Durante la instalaciÃ³n del Service Worker se precargan explÃ­citamente:

```text
/
/manifest.webmanifest
/icons/icon-192.png
/icons/icon-512.png
```

Estos recursos permiten disponer de elementos bÃ¡sicos de la aplicaciÃ³n cuando no existe conectividad.

## Funcionamiento offline

La experiencia offline estÃ¡ limitada a los recursos que hayan sido precargados o almacenados mediante las estrategias de cachÃ©.

Cuando no existe conectividad:

- Los recursos estÃ¡ticos previamente almacenados pueden utilizarse mediante **Cache First**.
- El manifest puede utilizarse desde la cachÃ© mediante **Stale While Revalidate**.
- Las navegaciones pueden utilizar una respuesta previamente almacenada mediante **Network First**.
- Los datos de inspecciones previamente almacenados pueden utilizarse como respaldo mediante **Network First**.
- Las solicitudes **Network Only** requieren conectividad.
- Una navegaciÃ³n sin conexiÃ³n y sin recursos disponibles puede mostrar una respuesta de fallback con estado HTTP `503`.

El proyecto todavÃ­a no implementa una cola de operaciones `POST` para sincronizaciÃ³n posterior. Por lo tanto, las operaciones de escritura sin conexiÃ³n pueden fallar.

## ActualizaciÃ³n e invalidaciÃ³n de cachÃ©

Las cachÃ©s utilizan una versiÃ³n explÃ­cita:

```text
CACHE_VERSION
```

Se mantienen cachÃ©s separadas para recursos estÃ¡ticos y recursos de ejecuciÃ³n.

Cuando se activa una nueva versiÃ³n del Service Worker:

1. Se identifican las cachÃ©s antiguas de la aplicaciÃ³n.
2. Se eliminan las versiones que ya no corresponden a la versiÃ³n actual.
3. Se conservan las cachÃ©s vigentes.
4. El nuevo Service Worker toma el control de los clientes mediante `self.clients.claim()`.

La eliminaciÃ³n de cachÃ©s se realiza durante `activate`, evitando eliminar la versiÃ³n funcional antes de que el nuevo Service Worker haya sido instalado correctamente.

## NormalizaciÃ³n de recursos estÃ¡ticos

Los recursos estÃ¡ticos de Next.js ubicados bajo:

```text
/_next/static/
```

utilizan una normalizaciÃ³n de la clave de cachÃ© para evitar que parÃ¡metros de consulta como:

```text
?v=...
```

generen entradas innecesariamente diferentes para el mismo recurso estÃ¡tico.

## Seguridad y privacidad

El Service Worker evita almacenar indiscriminadamente todas las respuestas.

No deben almacenarse:

- ContraseÃ±as.
- Tokens.
- Claves privadas.
- Credenciales.
- InformaciÃ³n personal real.
- Datos reales de estudiantes.
- InformaciÃ³n sensible.

El proyecto utiliza Ãºnicamente datos sintÃ©ticos.

Las solicitudes que no deben persistirse utilizan **Network Only**.

Las pruebas automatizadas tambiÃ©n verifican que `public/sw.js` no contenga secretos ni tokens.

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
- versionado de cachÃ©s;
- recursos precargados;
- cuatro estrategias de cachÃ©;
- `/api/inspections`;
- eliminaciÃ³n de cachÃ©s antiguas;
- control de clientes;
- recursos estÃ¡ticos de Next.js;
- normalizaciÃ³n de parÃ¡metros de consulta;
- registro del Service Worker;
- manejo de errores del registro.

### Pruebas de comportamiento

`tests/service-worker-behavior.spec.ts` verifica:

- precache durante `install`;
- eliminaciÃ³n controlada de cachÃ©s durante `activate`;
- comportamiento de solicitudes `POST`;
- comportamiento de solicitudes cross-origin;
- Cache First;
- Stale While Revalidate;
- protecciÃ³n ante respuestas HTTP `500`;
- ausencia de secretos o tokens.

### Pruebas offline

`tests/offline.spec.ts` verifica:

- navegaciÃ³n offline hacia la raÃ­z;
- fallback para rutas no visitadas;
- fallback `503` cuando no existe cachÃ©;
- Network First con pÃ©rdida de conectividad;
- disponibilidad offline de iconos precargados;
- disponibilidad offline del manifest;
- disponibilidad offline de `/api/inspections` despuÃ©s de una consulta exitosa;
- regresiÃ³n relacionada con respuestas `500`;
- comportamiento de recursos estÃ¡ticos no almacenados;
- comportamiento de solicitudes `POST` sin conexiÃ³n.

## VerificaciÃ³n de la Semana 3

La verificaciÃ³n completa puede ejecutarse mediante:

```bash
npm ci
npm test
make verify
npm run build
```

Cuando `make` no estÃ© disponible:

```bash
npm ci
npm test
npm run verify
npm run build
```

El resultado de las pruebas debe finalizar sin errores.

La entrega tambiÃ©n debe comprobar:

- `npm ci` exitoso;
- pruebas automatizadas exitosas;
- `make verify` exitoso o su equivalente documentado;
- build exitoso;
- GitHub Actions exitoso;
- ausencia de conflictos pendientes;
- ausencia de secretos, tokens o datos reales.

## Limitaciones actuales de la Semana 3

La implementaciÃ³n offline no representa una disponibilidad completa de toda la aplicaciÃ³n.

Actualmente:

- No existe una cola offline para operaciones `POST`.
- Las operaciones de escritura requieren conectividad.
- Los recursos que nunca fueron almacenados no pueden recuperarse sin conexiÃ³n.
- La informaciÃ³n disponible offline depende de las reglas explÃ­citas del Service Worker.
- Los datos utilizados por el proyecto son sintÃ©ticos.
- La sincronizaciÃ³n con un servidor todavÃ­a no estÃ¡ implementada.

## DocumentaciÃ³n de la estrategia de cachÃ©

La descripciÃ³n detallada de las estrategias utilizadas se encuentra en:

```text
docs/cache-strategy.md
```

La documentaciÃ³n debe mantenerse sincronizada con el comportamiento real de:

```text
public/sw.js
```

## Datos sintÃ©ticos

El proyecto utiliza exclusivamente datos sintÃ©ticos para las inspecciones.

Los datos de ejemplo incluyen informaciÃ³n ficticia relacionada con:

- TÃ©cnicos.
- Laboratorios.
- Fechas.
- Descripciones.
- Hallazgos.
- Estados de inspecciÃ³n.

No se utilizan datos reales de personas, estudiantes, docentes, tÃ©cnicos, laboratorios o instalaciones institucionales.

## Estructura principal

```text
.
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ requirements.md
â”‚   â”œâ”€â”€ decision-record.md
â”‚   â””â”€â”€ cache-strategy.md
â”œâ”€â”€ evidence/
â”‚   â””â”€â”€ individual.md
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ icons/
â”‚   â”‚   â”œâ”€â”€ icon-192.png
â”‚   â”‚   â””â”€â”€ icon-512.png
â”‚   â”œâ”€â”€ manifest.webmanifest
â”‚   â””â”€â”€ sw.js
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ verify.mjs
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ app-shell.tsx
â”‚   â”‚   â””â”€â”€ pwa-register.tsx
â”‚   â””â”€â”€ lib/
â”‚       â”œâ”€â”€ data/
â”‚       â””â”€â”€ pwa/
â”‚           â””â”€â”€ register-service-worker.ts
â”œâ”€â”€ tests/
â”‚   â”œâ”€â”€ starter.spec.mjs
â”‚   â”œâ”€â”€ manifest.spec.ts
â”‚   â”œâ”€â”€ service-worker.spec.ts
â”‚   â”œâ”€â”€ service-worker-behavior.spec.ts
â”‚   â””â”€â”€ offline.spec.ts
â”œâ”€â”€ package.json
â”œâ”€â”€ package-lock.json
â””â”€â”€ Makefile
```

## Estado de la Semana 3

La Semana 3 incorpora:

- Service Worker.
- Ciclo de vida `install`, `activate` y `fetch`.
- Precache de recursos definidos explÃ­citamente.
- Cache First.
- Stale While Revalidate.
- Network First.
- Network Only.
- Versionado e invalidaciÃ³n controlada de cachÃ©s.
- Registro del Service Worker.
- Fallback para navegaciÃ³n sin conexiÃ³n.
- Pruebas de comportamiento del Service Worker.
- Pruebas de funcionamiento offline.
- VerificaciÃ³n automatizada.
- DocumentaciÃ³n de la estrategia de cachÃ©.

Las funcionalidades implementadas durante las semanas anteriores se conservan y forman parte de la integraciÃ³n actual del proyecto.

## Seguridad y privacidad

El repositorio no debe contener:

- ContraseÃ±as.
- Tokens.
- Claves privadas.
- Credenciales.
- Variables de entorno con informaciÃ³n sensible.
- Datos personales reales.

Los datos utilizados en el proyecto son exclusivamente sintÃ©ticos.

## Â¿Por quÃ© esta versiÃ³n cumple con los requisitos de la semana 3?

Esta versiÃ³n cumple con los requisitos de la Semana 3 porque incorpora y documenta las funcionalidades necesarias para implementar el Service Worker, las estrategias de cachÃ© y el funcionamiento offline de la PWA.

- `public/sw.js` implementa el ciclo de vida del Service Worker mediante los eventos `install`, `activate` y `fetch`.
- Se utiliza versionado explÃ­cito de las cachÃ©s mediante `CACHE_VERSION`.
- Durante la instalaciÃ³n se precargan recursos bÃ¡sicos de la aplicaciÃ³n mediante `PRECACHE_URLS`.
- Se implementan las cuatro estrategias de cachÃ© definidas para el proyecto:
  - **Cache First** para recursos estÃ¡ticos.
  - **Stale While Revalidate** para el manifest.
  - **Network First** para las navegaciones y los datos sintÃ©ticos de inspecciones.
  - **Network Only** para solicitudes que no deben persistirse.

- Se implementa la eliminaciÃ³n controlada de cachÃ©s antiguas durante `activate`.
- Se incorpora un fallback para las navegaciones cuando no existe conectividad.
- El registro del Service Worker se encuentra separado en `src/lib/pwa/register-service-worker.ts` y se realiza sin bloquear la carga inicial de la aplicaciÃ³n.
- La estrategia de cachÃ© utilizada estÃ¡ documentada en `docs/cache-strategy.md` y corresponde al comportamiento implementado en `public/sw.js`.
- Existen pruebas automatizadas para validar el comportamiento del Service Worker mediante `tests/service-worker.spec.ts` y `tests/service-worker-behavior.spec.ts`.
- Existen pruebas especÃ­ficas para pÃ©rdida de conectividad y funcionamiento offline mediante `tests/offline.spec.ts`.
- Las pruebas incluyen casos de regresiÃ³n, fallback offline, recursos precargados, solicitudes `POST`, solicitudes cross-origin y respuestas de error.
- `npm test` ejecuta las pruebas del starter, manifest, Service Worker y funcionamiento offline.
- La verificaciÃ³n reproducible puede ejecutarse mediante `make verify` o su equivalente `npm run verify`.
- El proyecto utiliza Ãºnicamente datos sintÃ©ticos y no almacena indiscriminadamente informaciÃ³n sensible, credenciales o tokens.
- `evidence/individual.md` proporciona la estructura necesaria para registrar las contribuciones, commits, decisiones tÃ©cnicas, pruebas y validaciones de cada integrante.

Por lo anterior, la versiÃ³n integra las contribuciones de los tres integrantes y mantiene las funcionalidades implementadas durante las semanas anteriores, incorporando las capacidades de Service Worker, cachÃ©, recuperaciÃ³n ante pÃ©rdida de conectividad y pruebas automatizadas requeridas para la Semana 3.

# Semana 4 - Renderizado (CSR/SSR), pruebas y reproducibilidad

Durante la Semana 4 se documento y probo la estrategia de renderizado del
listado y el detalle de inspecciones, se agregaron pruebas automatizadas de
ese comportamiento y se verifico que la instalacion, el build y las pruebas
funcionen en un entorno limpio.

## Renderizado: CSR vs SSR

Las rutas `/` (listado) y `/inspecciones/[id]` (detalle) son Client
Components de Next.js. La comparacion completa entre CSR y SSR aplicada al
dominio de inspecciones, la decision tecnica, los trade-offs, el impacto en
la carga, la accesibilidad, la complejidad, los limites, los riesgos y los
supuestos se documentan en:

```text
docs/rendering-decision.md
```

## Pruebas de renderizado

Las pruebas se encuentran en:

```text
tests/rendering.spec.ts
```

Cubren, sobre datos 100% sinteticos y sin depender de servicios privados:

- el listado de inspecciones (campos requeridos, datos no vacios);
- el detalle de una inspeccion existente;
- un estado de carga (loading);
- un estado de error;
- el comportamiento ante un id inexistente;
- una regresion relevante (ids duplicados en el listado).

Estas pruebas ejercitan la logica de carga/busqueda extraida en
`src/lib/data/inspection-view.ts` (usada solo para fines de prueba, ya que el
proyecto no tiene instalado un renderer de React como jsdom o Playwright).
Esta decision y su limite se explican en `docs/rendering-decision.md`.

## Como reproducir la evidencia de la Semana 4

```bash
npm ci
npm test
make verify
npm run build
```

Cuando `make` no este disponible:

```bash
npm ci
npm test
npm run verify
npm run build
```

`npm test` debe mostrar `PASS` para todos los archivos de prueba, incluyendo
`tests/rendering.spec.ts`. `npm run build` debe compilar sin errores y
mostrar la tabla `Route (app)` con la columna `First Load JS`, que es la
metrica de carga documentada en `docs/rendering-decision.md`.

## Verificacion de la Semana 4

La entrega debe comprobar:

- `npm ci` exitoso;
- `npm test` exitoso, incluyendo `tests/rendering.spec.ts`;
- `make verify` exitoso o su equivalente documentado (`npm run verify`);
- `npm run build` exitoso, con la tabla de `First Load JS` como evidencia de
  la metrica de carga;
- GitHub Actions exitoso;
- ausencia de secretos, tokens o datos reales;
- `evidence/individual.md` actualizado con la evidencia individual del
  integrante responsable.

## Limitaciones actuales de la Semana 4

- Las pruebas de `tests/rendering.spec.ts` no renderizan JSX real (no hay
  jsdom ni Playwright instalados); prueban la logica de datos/carga, no el
  DOM.
- La metrica de carga usada (First Load JS de `next build`) mide tamano de
  bundle, no tiempo real medido en un dispositivo o red especifica.
- Los estados de carga simulados (`setTimeout`) son artificiales y no
  representan una peticion de red real, ya que los datos son sinteticos y
  estan en memoria.

## Estado de la Semana 4

La Semana 4 incorpora:

- Documentacion de la decision de renderizado (CSR vs SSR) en
  `docs/rendering-decision.md`.
- Pruebas automatizadas de listado, detalle, carga, error, id inexistente y
  una regresion relevante en `tests/rendering.spec.ts`.
- Metrica de carga reproducible (`First Load JS` via `npm run build`).
- Verificacion de instalacion, build y pruebas en un entorno limpio.

Las funcionalidades implementadas durante las semanas anteriores (App Shell,
manifest, Service Worker, estrategias de cache y funcionamiento offline) se
conservan y forman parte de la integracion actual del proyecto.

## Por que esta version cumple con los requisitos de la Semana 4

- Existe `tests/rendering.spec.ts` con pruebas deterministas, sin
  dependencia de servicios privados, que cubren listado, detalle, un estado
  de carga, un estado de error, el comportamiento ante un id inexistente y
  una regresion relevante (verificado con `npm test`, ver salida en la
  evidencia individual).
- Existe `docs/rendering-decision.md`, que compara CSR y SSR, documenta
  trade-offs, complejidad, impacto en la carga, accesibilidad, limites,
  riesgos y supuestos, e incluye una metrica de carga repetible con su
  procedimiento (`npm run build`).
- `README.md` documenta instalacion, ejecucion, verificacion y como
  reproducir la evidencia de esta actividad.
- `npm ci`, `npm test`, `make verify` (o `npm run verify`) y `npm run build`
  se ejecutan correctamente en un entorno limpio.