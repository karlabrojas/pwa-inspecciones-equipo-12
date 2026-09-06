# Evidencia individual — completar antes de entregar

- Grupo y equipo: 10° B - Equipo 12
- Repositorio del equipo:https://github.com/karlabrojas/pwa-inspecciones-equipo-12

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
