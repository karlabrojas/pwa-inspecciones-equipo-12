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

` git clone https://github.com/karlabrojas/pwa-inspecciones-equipo-12.git `

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
