# Evidencia individual — completar antes de entregar

- Grupo y equipo: 10° B - Equipo 12
- Repositorio del equipo:https://github.com/karlabrojas/pwa-inspecciones-equipo-12

# SEMANA 1

## Integrante: Kevin Ricardo Simon Alfaro

- **Mi contribución concreta y enlace:** redacté las secciones 4 (Requisitos no funcionales medibles: reproducibilidad, accesibilidad, seguridad, privacidad, rendimiento, offline futuro), 5 (Datos sintéticos y límites) y 6 (Criterios de aceptación de Semana 1) en `docs/requirements.md`. En `docs/decision-record.md` reforcé el análisis de "web tradicional" relacionándolo con el riesgo de conectividad intermitente, redacté la sección "Decisión" (justificación de PWA), y redacté "Consecuencias y riesgos" y "Validación" en conjunto con el resto del equipo. Commits: [`06a67ce`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/06a67ce) (RNF, datos sintéticos, criterios de aceptación y refuerzo de web tradicional), [`4cac718`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/4cac718) (sección Decisión), [`9836c12`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/9836c12) (Consecuencias, riesgos y Validación).
- **Decisión que puedo explicar y por qué:** al reforzar "web tradicional" decidí no reescribir el análisis que ya existía, sino complementarlo agregando específicamente el riesgo de pérdida de datos cuando la conexión se pierde durante el registro de una inspección (Escenario 3 del proyecto), porque ese análisis original no mencionaba explícitamente el caso de conectividad intermitente, que es la restricción central del proyecto.
- **Comando o prueba que ejecuté:** `npm ci`, `npm run dev` y `npm run verify`.
- **Resultado real que observé:** `npm ci` instaló las dependencias sin errores; `npm run dev` levantó el servidor y en http://localhost:3000 se mostró correctamente la pantalla inicial con las inspecciones sintéticas de ejemplo; `npm run verify` terminó con el mensaje `Starter verificable: PASS` y generó `reports/verification.json` con el contenido: `{"schemaVersion": 1, "checkedAt": "2026-09-06T06:08:24.676Z", "status": "pass", "missing": []}`.
- **Qué verifica esa prueba y qué no verifica:** `npm run verify` confirma que la estructura de archivos requerida está presente y que no falta ningún archivo esperado (`missing: []`). No verifica la calidad ni la coherencia del análisis documental de `requirements.md` o `decision-record.md`, ni certifica que no existan datos sensibles; tampoco prueba funcionalidades futuras como offline, sincronización o autenticación, que no se implementan en Semana 1.
- **Limitación, dificultad o riesgo que identifiqué:** mi mayor riesgo no es técnico sino de contenido. Las secciones de Decisión, Consecuencias/riesgos y Validación en `docs/decision-record.md` son un análisis argumentado y una proyección de lo que se validará en semanas futuras, no algo que `npm run verify` pueda comprobar; el "pass" técnico solo confirma que la estructura del proyecto está completa, no que la profundidad del análisis sea suficiente. Si el equipo o el docente considera que falta profundidad en algún punto de la justificación de PWA o de los riesgos identificados, habría que ajustar el documento en una revisión posterior.
- **Uso de IA:** usé un asistente de IA conversacional para estructurar y redactar un primer borrador de las secciones 4, 5 y 6 de `docs/requirements.md`, y de las secciones de multiplataforma, refuerzo de web tradicional, Decisión, Consecuencias/riesgos y Validación en `docs/decision-record.md`. Yo decidí qué contenido conservar y lo conecté con los escenarios y requisitos que ya había definido el equipo. Revisé personalmente cada sección, ejecuté los comandos de verificación y confirmé las salidas; no acepté nada sin validarlo.

## Integrante: Karla Beatriz Rojas Rojas

- **Mi contribución concreta y enlace:** Redacté las secciones 2 (usuarios y escenarios) y 3 (requisitos funcionales) en `docs/requirements.md`. De igual manera, participé en el análisis del contexto y las restricciones del proyecto. Además, desarrollé, en la sección de alternativas de aplicación, los apartados de aplicación nativa y solución multiplataforma. También apoyé con una comparación entre las cuatro alternativas en `docs/decision-record.md`.
  Enlaces de commits:
- (docs: add users, scenarios and functional requirements)[`4e8d82d`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/4e8d82d05967213c88f31631cc97a2624ed33233)
- (docs: add native, multiplatform and alternatives comparison)[`467e4ed`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/467e4ed692ed8a182a40fca32234a85d3f7672fc)
- (docs: add ADR context and constraints)[`c46258b`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/c46258bc572a1dccd3d177203262fe2cd1103ddc).
- **Decisión que puedo explicar y por qué:** La decisión de seleccionar una PWA como estrategia de aplicación, ya que esta se relaciona con las restricciones del proyecto, la conectividad intermitente, el alcance de 14 semanas y la necesidad de mantener un desarrollo reproducible.
- **Comando o prueba que ejecuté:** `npm ci`, `npm run dev` y `npm run verify`.
- **Resultado real que observé:**
  - `npm ci`: instaló correctamente las dependencias del proyecto. Sin embargo, reportó 2 vulnerabilidades de severidad alta.
  - `npm run dev`: inició el proyecto correctamente y el servidor quedó disponible localmente en `http://localhost:3000`.
  - `npm run verify`: realizó la verificación y mostró el resultado `Starter verificable: PASS`. También se generó el archivo `reports/verification.json`.
- **Qué verifica esa prueba y qué no verifica:**
  - La ejecución de `npm ci` demuestra que las dependencias definidas en el proyecto pueden instalarse y que el entorno puede prepararse mediante el procedimiento indicado.
  - La ejecución de `npm run dev` demuestra que la aplicación puede iniciarse correctamente en el entorno local y que el servidor de desarrollo de Next.js está disponible en `localhost:3000`.
  - La ejecución de `npm run verify` demuestra que las verificaciones proporcionadas por el proyecto finalizaron correctamente y que el starter fue considerado verificable mediante el resultado `PASS`.
    Estas pruebas no demuestran que las funcionalidades futuras de funcionamiento offline, sincronización, notificaciones o autenticación estén implementadas, ya que dichas capacidades corresponden a etapas posteriores del proyecto.
- **Limitación, dificultad o riesgo que identifiqué:** Una limitación identificada durante la ejecución fue que `npm ci` reportó 2 vulnerabilidades de severidad alta en las dependencias instaladas. Aunque la instalación y la verificación terminaron correctamente, este resultado debe considerarse y revisarse posteriormente antes de utilizar la aplicación en un entorno real.
- **Uso de IA:** Utilicé una herramienta de inteligencia artificial como apoyo, principalmente para estructurar los escenarios, las condiciones de aceptación, los requisitos y la comparación de las alternativas de aplicación. El contenido fue revisado y adaptado al contexto, las restricciones y los requisitos específicos de la actividad antes de incorporarlo al repositorio.

## Integrante: Angel Romero Barragan

- **Mi contribución concreta y enlace:** Redacté el apartado de contexto, problemas y limitaciones del proyecto en `docs/requirements.md`, donde describí el problema de las inspecciones de mantenimiento, los usuarios que necesitan registrar las inspecciones, la importancia de la conectividad intermitente, los objetivos que se pretenden solucionar y las funcionalidades que quedan fuera del alcance. También elaboré en `docs/decision-record.md` el análisis comparativo entre una PWA y una web tradicional, considerando sus principales características y diferencias relacionadas con el funcionamiento sin conexión, almacenamiento local, instalación, actualizaciones y dependencia de Internet.

Enlaces de commits:

- (docs: Context, issues, and limitations of the project)[`1f4bdc6`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/1f4bdc67428fed0d0f3e3c387e7ae1d65842d050)
- (docs: Analysis of PWAs and traditional web apps)[`89f1105`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/89f110524d854b61cdb8b7b1ab58b4ecb54574fb)
- (docs: Project status update)[`b0c0afb`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/b0c0afbfdff7b4f77dd4a8e2b31a02afbff4604f)

- **Decisión que puedo explicar y por qué:** La decisión principal fue documentar y justificar por qué una PWA resulta adecuada para el proyecto. Consideré como factores principales la conectividad intermitente, la necesidad de registrar información desde diferentes dispositivos y la posibilidad de utilizar almacenamiento local para evitar la pérdida de información. También decidí diferenciar la PWA de una web tradicional para dejar claro que la elección no se basa únicamente en que pueda instalarse, sino en sus capacidades para manejar escenarios donde la conexión no sea estable. En el análisis se documentó que una PWA puede utilizar tecnologías como Service Workers, IndexedDB y Cache API para implementar posteriormente estrategias offline-first.

- **Comando o prueba que ejecuté:** `npm ci`, `npm run dev` y `npm run verify`.

- **Resultado real que observé:** `npm ci` instaló las dependencias necesarias del proyecto; `npm run dev` permitió iniciar la aplicación de Next.js y visualizar la pantalla inicial de inspecciones en http://localhost:3000; y `npm run verify` permitió comprobar que la estructura inicial del proyecto cumplía con las verificaciones establecidas, y lo notifico con un `Starter verificable: PASS`, tambien creo la carpeta `reports/verification.json` y dentro un objeto con `{
  "schemaVersion": 1,
  "checkedAt": "2026-09-06T16:26:42.231Z",
  "status": "pass",
  "missing": []
}`.
- **Qué verifica esa prueba y qué no verifica:** `npm ci` comprueba que las dependencias definidas en el proyecto puedan instalarse correctamente. `npm run dev` comprueba que la aplicación pueda iniciarse y ejecutarse localmente. `npm run verify` comprueba las condiciones de verificación establecidas para el starter y su estructura requerida. Estas pruebas no comprueban todavía el funcionamiento offline, la sincronización de datos, el almacenamiento mediante IndexedDB, las notificaciones ni la autenticación, ya que esas funcionalidades corresponden a etapas posteriores del proyecto.

- **Limitación, dificultad o riesgo que identifiqué:** Limitación, dificultad o riesgo que identifiqué: Una de las principales dificultades identificadas es que la implementación de notificaciones push puede representar un tema complejo y poco conocido durante el desarrollo. Debido a que requiere familiarizarse con tecnologías y configuraciones específicas, existe el riesgo de que su implementación tome más tiempo del establecido inicialmente para esta etapa del proyecto. Por lo tanto, será necesario considerar tiempo adicional para investigar, realizar pruebas y resolver posibles problemas relacionados con su funcionamiento.

- **Uso de IA:** Utilicé una herramienta de inteligencia artificial como apoyo para organizar y redactar algunas ideas relacionadas con el problema de las inspecciones, la conectividad intermitente, las diferencias entre una PWA y una web tradicional y las posibles limitaciones del proyecto. Posteriormente revisé y adapté el contenido para relacionarlo con los requisitos y restricciones establecidos para el proyecto. La IA se utilizó como herramienta de apoyo para la redacción y organización de la información, mientras que la selección del contenido y su incorporación al repositorio fueron realizadas y revisadas por mí.

# Evidencia Week 2

## Integrante: Kevin Ricardo Simon Alfaro

- **Mi contribución concreta y enlace:** Implementé los estados de interfaz `loading`, `error`, `empty` y `normal` en `src/app/page.tsx`, incluyendo el botón de reintento y la visualización de inspecciones sintéticas. También integré el manifest en `src/app/layout.tsx`, agregué el enlace de salto al contenido principal en `src/components/app-shell.tsx`, actualicé los estilos de la interfaz en `src/app/globals.css`, incorporé la prueba automatizada del manifest en `tests/manifest.spec.ts` y ajusté la verificación del proyecto. Commit: [`184dac2`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/184dac2).
- **Decisión que puedo explicar y por qué:** Separé los estados de carga, error, vacío y contenido normal mediante un estado explícito en la página principal. Esta decisión permite que cada situación tenga una respuesta visible y verificable, en lugar de mostrar siempre el mismo listado. También mantuve los datos sintéticos y añadí `aria-live`, `role="status"` y `role="alert"` para comunicar los cambios de estado a tecnologías de asistencia.
- **Comando o prueba que ejecuté:** `npm test` y `npm run verify`.
- **Resultado real que observé:** `npm test` terminó correctamente con `starter.spec.mjs: PASS` y `manifest.spec.ts: PASS`. `npm run verify` terminó con `Starter verificable: PASS` y generó `reports/verification.json`.
- **Qué verifica esa prueba y qué no verifica:** Las pruebas confirman que la estructura del starter continúa válida y que el manifest existe, contiene sus campos obligatorios, usa `display: "standalone"`, define los iconos de 192x192 y 512x512, y referencia archivos existentes. No verifican mediante navegador la apariencia visual, la navegación con teclado, la compatibilidad en todos los dispositivos ni el funcionamiento offline real o la sincronización futura.
- **Limitación, dificultad o riesgo que identifiqué:** La implementación de esta semana simula los estados con controles de demostración y utiliza datos sintéticos en memoria. Todavía no existe un formulario persistente, almacenamiento local, Service Worker ni sincronización; por eso los estados preparados no representan todavía un flujo offline completo.
- **Uso de IA:** Utilicé una herramienta de IA como apoyo para revisar la estructura de los estados de interfaz, los criterios de accesibilidad y la prueba del manifest. Decidí qué cambios incorporar, revisé el código dentro del repositorio, ejecuté las pruebas y confirmé personalmente sus resultados antes de documentarlos.
- **Validación humana realizada:** Revisé manualmente la pantalla inicial, cambié entre los estados de carga, error, vacío y normal, comprobé que el botón `Reintentar` regresara al estado normal y confirmé que el proyecto conservara el funcionamiento esperado después de ejecutar las pruebas.
# SEMANA 2

## Integrante: Karla Beatriz Rojas Rojas

- **Mi contribución concreta y enlace:** Implementé el componente reutilizable `AppShell` para establecer la estructura principal de la PWA y posteriormente lo integré con el layout raíz de Next.js. Mis cambios se realizaron principalmente en:
  - [`src/components/app-shell.tsx`](../src/components/app-shell.tsx)
  - [`src/app/layout.tsx`](../src/app/layout.tsx)
  - [`src/app/page.tsx`](../src/app/page.tsx)
  - [`src/app/globals.css`](../src/app/globals.css)
    La implementación incluye el encabezado, navegación principal, contenido mediante `children`, pie de página, landmarks semánticos, navegación mediante teclado, indicador visual de foco y adaptación para viewport móvil y escritorio.
    Enlaces de commits:
  - `feat: implement accessible application shell` — [`4655da7`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/4655da7cf39470aa34af4e8b35792014698604ce) — ISSUE #3: Construir el componente App Shell
  - `feat: integrate app shell with Next.js layout` — [`21b4e15`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/21b4e1579be36793ef4d07ee337958adb4d916b0) — ISSUE #4: Integrar App Shell con el layout de Next.js.

- **Decisión que puedo explicar y por qué:** Decidí concentrar la estructura global de la aplicación en un componente `AppShell` y utilizar `children` para insertar el contenido específico de cada página.
  Esta decisión permite separar las responsabilidades entre la estructura global de la PWA y el contenido de `page.tsx`. De esta forma, elementos como el encabezado, navegación, `<main>` y footer no necesitan repetirse en cada página.
  También utilicé elementos HTML semánticos como `<header>`, `<nav>`, `<main>` y `<footer>` para facilitar la accesibilidad y hacer reconocibles los landmarks de la aplicación.
  Para la navegación mediante teclado utilicé enlaces HTML (`<a>`) en lugar de elementos no semánticos con eventos personalizados. Esto permite aprovechar el comportamiento nativo del navegador con `Tab` y `Enter`, complementándolo con un indicador visual mediante `:focus-visible`.

- **Comando o prueba que ejecuté:** `npm run dev`, `npm run verify` y realicé una prueba manual de navegación mediante teclado utilizando `Tab` y `Enter`.

- **Resultado real que observé:** La aplicación cargó correctamente en el entorno local y mostró el App Shell alrededor del contenido de la página.
  Durante la prueba con teclado, los elementos de navegación pudieron recorrerse mediante `Tab`, mostraron un indicador visual de foco y pudieron activarse mediante `Enter`. La estructura también se mostró correctamente al cambiar entre viewport de escritorio y móvil.
  El comando de verificación terminó con: PASS

- **Qué verifica esa prueba y qué no verifica:** La prueba manual verifica que el App Shell está integrado correctamente con la aplicación, que la navegación es operable mediante teclado y que el diseño mantiene una estructura utilizable en escritorio y móvil.
  El comando `npm run verify` verifica las validaciones automatizadas definidas por el proyecto.
  Estas pruebas no demuestran por sí solas que todas las funcionalidades futuras de la PWA estén implementadas, ni que exista persistencia, sincronización offline, backend o almacenamiento de datos reales.

- **Limitación, dificultad o riesgo que identifiqué:** Una dificultad fue separar correctamente las responsabilidades entre `AppShell` y `page.tsx`, evitando duplicar elementos como `<main>` y `<footer>`.
  También identifiqué que las rutas utilizadas por la navegación deben existir para que los enlaces no produzcan errores `404`. Por ello, la navegación del App Shell debe coordinarse con las páginas y rutas que se implementen posteriormente.
  Otra consideración fue mantener la estructura existente de la Semana 1 para evitar introducir cambios innecesarios mientras se incorporaba el nuevo shell.

- **Uso de IA:** Utilicé una herramienta de inteligencia artificial de apoyo durante la implementación del App Shell.
  La IA se utilizó para:
  - Revisar la estructura del componente `AppShell`.
  - Proponer una organización semántica con `header`, `nav`, `main` y `footer`.
  - Revisar aspectos de navegación mediante teclado y foco visible.
  - Sugerir una separación de responsabilidades entre `AppShell`, `layout.tsx` y `page.tsx`.
    La implementación final fue revisada y validada manualmente, incluyendo la ejecución local, navegación mediante teclado y verificación del proyecto.

## Integrante: Angel Romero Barragan

- **Mi contribución concreta y enlace:** Implementé la configuración del manifest de la PWA mediante la creación y configuración del archivo `public/manifest.webmanifest.` En este archivo definí la identidad y el comportamiento de la aplicación al ser utilizada como PWA, incluyendo el nombre completo `(name)`, nombre corto `(short_name)`, página inicial `(start_url)`, alcance de la aplicación `(scope)` y modo de visualización `(display)`. También agregué los iconos correspondientes de la aplicación en los tamaños de `192x192` y `512x512`, ubicados en `public/icons/`. Los iconos fueron diseñados de acuerdo con la temática del proyecto de inspecciones de laboratorio. 

  Enlaces de commits:
  - `docs: document week 2 setup and verification` — [`fb3db52`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/fb3db52d499a8c46dd5c833e82a8cb6a62aa8e6d) — ISSUE #2: Documentar README de la Semana 2
  - `feat: add installable PWA manifest` — [`57150d0`](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/57150d00843215e6c26e530f81d4b1e5a4ec826f) — ISSUE #2: Implementar manifest instalable de la PWA
  - `ISSUE #1 — Analizar el estado actual del repositorio` — (https://github.com/karlabrojas/pwa-inspecciones-equipo-12/issues/1)
  
- **Decisión que puedo explicar y por qué:** Decidí utilizar un manifest con `display: "standalone"` para que la aplicación pueda presentarse como una aplicación independiente cuando sea instalada, sin depender de la interfaz normal del navegador. También establecí `start_url` y `scope en /`, ya que la aplicación se desarrolla desde la raíz del proyecto y las diferentes rutas de la PWA deben pertenecer al mismo alcance. Para los iconos seleccioné los tamaños de `192x192` y `512x512`, ya que permiten proporcionar recursos gráficos adecuados para diferentes contextos de instalación y visualización. Los iconos mantienen una temática relacionada directamente con el proyecto, utilizando elementos visuales de una lista de inspección, un matraz de laboratorio y una marca de verificación. La configuración actual puede observarse en `public/manifest.webmanifest`.

- **Comando o prueba que ejecuté:**

  `npm run verify`

  La ejecución terminó correctamente mostrando:

  `Starter verificable: `PASS`
  Además, la verificación generó el reporte `reports/verification.json`. El script de verificación actual comprueba que exista `public/manifest.webmanifest`, además de los demás archivos requeridos por el proyecto.

- **Qué verifica esa prueba y qué no verifica:** `npm run verify` comprueba que los archivos y artefactos requeridos por el proyecto estén presentes, incluyendo el manifest de la PWA y el archivo de pruebas asociado al manifest. Si todos los archivos existen, muestra el resultado `Starter verificable: PASS` y genera el reporte de verificación. Esta prueba no comprueba por sí sola que la aplicación pueda instalarse correctamente en todos los navegadores, ni que los iconos se visualicen correctamente en cada dispositivo. Tampoco comprueba el funcionamiento offline, la sincronización de información o las demás funcionalidades futuras de la PWA.

- **Limitación, dificultad o riesgo que identifiqué:** Una dificultad fue seleccionar y configurar correctamente los elementos necesarios del manifest sin agregar información innecesaria o sensible. También fue necesario considerar que las rutas indicadas en el manifest debían coincidir con los archivos realmente existentes dentro de `public/`, especialmente los iconos de `192x192` y `512x512`. Un riesgo identificado es que la presencia del manifest y los iconos no garantiza por sí sola que toda la experiencia de instalación de la PWA esté completa, ya que posteriormente será necesario implementar y validar otras características relacionadas con el funcionamiento offline y la experiencia PWA.

- **Uso de IA:** Utilicé una herramienta de inteligencia artificial como apoyo durante la implementación del manifest. La utilicé principalmente para comprender la función de las propiedades `name`, `short_name`, `start_url`, `scope`, `display` e `icons`, así como para organizar la estructura del archivo `manifest.webmanifest` y definir una propuesta de diseño para los iconos de la aplicación. También utilicé IA como apoyo para revisar que la configuración fuera coherente con los requisitos de la `Issue #2`. La implementación final fue revisada y adaptada al contexto del proyecto, y ejecuté personalmente el comando de verificación para comprobar el estado del repositorio.
