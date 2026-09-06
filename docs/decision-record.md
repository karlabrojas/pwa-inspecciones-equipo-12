# ADR-001 — Estrategia de aplicación

## Estado

Aceptada - 6 de septiembre de 2026

## Contexto y restricciones

El proyecto consiste en desarrollar una PWA para registrar inspecciones de mantenimiento de laboratorios y espacios académicos. Una de las principales restricciones es que la conectividad puede ser intermitente durante las inspecciones, por lo que la aplicación debe considerar una evolución hacia un funcionamiento que reduzca la dependencia de Internet.

El uso principal será desde dispositivos móviles por parte de técnicos de mantenimiento, aunque también debe ser posible consultar la información desde otros dispositivos. Por este motivo, la solución debe ofrecer una experiencia adecuada para pantallas pequeñas y diferentes dispositivos.

Durante el desarrollo se utilizarán únicamente datos sintéticos. No se utilizarán datos reales de estudiantes, docentes, técnicos ni información institucional sensible.

El proyecto tiene un alcance académico de 14 semanas, por lo que la solución debe poder desarrollarse y mantenerse dentro del tiempo disponible. Se prioriza una arquitectura que permita avanzar de manera progresiva sin introducir complejidad innecesaria.

También se requiere que el desarrollo y las entregas sean reproducibles. El proyecto debe conservar el entorno proporcionado por el curso y permitir instalar, ejecutar, verificar y construir la aplicación mediante procedimientos documentados y consistentes.

## Alternativas consideradas

### ¿Qué es una PWA?

Una PWA (Progressive Web App) es una aplicación web que utiliza tecnologías como Service Workers, almacenamiento local y capacidades de instalación para ofrecer una experiencia similar a la de una aplicación nativa, pudiendo funcionar parcialmente sin conexión y adaptarse a diferentes dispositivos.
Caracteristicas de las PWA:

- Se accede desde navegador, pero puede instalarse en el dispositivo
- Puede instalarse como aplicación sin una tienda
- Puede funcionar parcialmente sin Internet
- Puede almacenar datos localmente y sincronizarlos después
- Puede utilizar IndexedDB, Cache API, etc.
- Se pueden gestionar automáticamente mediante la aplicación web
- Puede soportar notificaciones push, dependiendo del navegador/SO
- No requiere publicar obligatoriamente en una tienda
- Se desarrolla con tecnologías web
- No necesariamente necesita internet o puede reducirse mediante estrategias offline-first

### ¿Qué es una web tradicional?

Una web tradicional es una aplicación o sitio que se ejecuta principalmente dentro de un navegador y depende del servidor y de una conexión a Internet para obtener o enviar información. A diferencia de una PWA, normalmente no incorpora mecanismos avanzados para funcionar sin conexión, instalarse como aplicación o sincronizar datos cuando se recupera la conectividad.

- Se accede principalmente desde el navegador
- No se instala como aplicación
- Generalmente requiere conexión
- Una petición puede fallar al perder conexión
- Puede utilizar almacenamiento local, pero normalmente con menor integración offline
- Se actualiza al cargar la página desde el servidor
- Tiene notificaciones push más limitadas
- No requiere tienda
- Se desarrolla con tecnologías web
- Dependede normalmente de internet

### ¿Qué es una aplicación nativa?

Una aplicación nativa es una aplicación desarrollada específicamente para un sistema operativo o plataforma, utilizando las herramientas y tecnologías propias de ese entorno. Por ejemplo, una aplicación para Android puede desarrollarse específicamente para ese sistema, mientras que una aplicación para iOS puede requerir una implementación diferente.

Entre sus principales características se encuentran:

- Se instala directamente en el dispositivo.
- Puede funcionar sin conexión cuando incorpora almacenamiento local.
- Tiene amplio acceso a capacidades del dispositivo, como cámara, almacenamiento, sensores y notificaciones.
- Puede ofrecer un rendimiento y una experiencia de usuario optimizados para la plataforma.
- Las actualizaciones pueden requerir la instalación de nuevas versiones.
- Su distribución puede depender de tiendas de aplicaciones y sus procesos de publicación.
- Si se requiere Android e iOS, normalmente implica desarrollar y mantener versiones específicas para cada plataforma.

Para este proyecto, una aplicación nativa permitiría implementar almacenamiento local y funcionamiento sin conexión, por lo que técnicamente puede responder a la conectividad intermitente. También tendría la ventaja de poder utilizar capacidades del dispositivo en futuras funcionalidades, como cámara o notificaciones.

Sin embargo, desarrollar aplicaciones nativas para diferentes plataformas aumentaría el tiempo y costo de desarrollo y mantenimiento. Además, el proyecto tiene un alcance de 14 semanas y las inspecciones de mantenimiento no requieren actualmente capacidades avanzadas del dispositivo. Por estas razones, aunque es una alternativa técnicamente viable, representa una mayor carga de desarrollo que una solución web progresiva para las necesidades actuales.

### ¿Qué es una solución multiplataforma?

Una solución multiplataforma permite desarrollar una aplicación utilizando una base de código o conjunto de tecnologías compartidas para posteriormente ejecutarla en diferentes sistemas operativos, como Android e iOS. Su objetivo es reducir la necesidad de crear y mantener una aplicación completamente independiente para cada plataforma.

Entre sus principales características se encuentran:

- Permite reutilizar una parte importante del código entre diferentes plataformas.
- Puede instalarse como aplicación en los dispositivos compatibles.
- Puede utilizar almacenamiento local para soportar escenarios sin conexión, dependiendo de la tecnología utilizada.
- Puede proporcionar acceso a diferentes capacidades del dispositivo mediante APIs o componentes del framework.
- Reduce el trabajo respecto al desarrollo de aplicaciones nativas independientes.
- Requiere mantener el framework multiplataforma y verificar su compatibilidad con las plataformas objetivo.
- La distribución puede involucrar tiendas de aplicaciones cuando se generan aplicaciones instalables para móviles.

Para este proyecto, una solución multiplataforma podría facilitar la creación de una aplicación móvil para distintos sistemas operativos y permitir funcionalidades como almacenamiento local y acceso a determinadas capacidades del dispositivo. También podría reducir el esfuerzo respecto a desarrollar dos aplicaciones nativas completamente independientes.

Sin embargo, continúa implicando una infraestructura de desarrollo y mantenimiento mayor que una aplicación web progresiva. Además, para el alcance actual del proyecto no es necesario desarrollar aplicaciones móviles independientes ni depender de una tienda de aplicaciones. Debido al límite de 14 semanas y a la necesidad de mantener un desarrollo reproducible, esta alternativa es viable, pero agrega complejidad que no resulta indispensable para las necesidades actuales.

### Comparación de alternativas

| Criterio                    | PWA                                                                                  | Web tradicional                            | Aplicación nativa                                            | Multiplataforma                                                   |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Instalación                 | Puede instalarse como aplicación desde el navegador                                  | Generalmente se utiliza desde el navegador | Se instala directamente en el dispositivo                    | Puede instalarse como aplicación                                  |
| Funcionamiento offline      | Puede implementarse mediante almacenamiento local, caché y estrategias offline-first | Normalmente depende más de la conexión     | Puede funcionar offline mediante almacenamiento local        | Puede funcionar offline mediante almacenamiento local             |
| Distribución                | Puede distribuirse mediante la web sin depender obligatoriamente de una tienda       | Distribución mediante una URL              | Puede requerir tiendas de aplicaciones                       | Puede requerir tiendas para distribuir aplicaciones móviles       |
| Desarrollo                  | Una base web para diferentes dispositivos                                            | Una base web                               | Puede requerir desarrollo específico por plataforma          | Permite reutilizar código entre plataformas                       |
| Mantenimiento               | Centralizado en la aplicación web                                                    | Centralizado en el servidor                | Puede requerir mantener diferentes versiones                 | Requiere mantener el framework y sus versiones                    |
| Capacidades del dispositivo | Acceso mediante APIs web, con algunas limitaciones                                   | Más limitado que una PWA                   | Amplio acceso a capacidades del dispositivo                  | Amplio acceso mediante APIs/frameworks                            |
| Adecuación al proyecto      | Alta: móvil, web, futura capacidad offline y distribución sencilla                   | Media-baja: mayor dependencia de Internet  | Media: técnicamente adecuada, pero mayor costo y complejidad | Media: reduce desarrollo frente a nativa, pero agrega complejidad |
| Principales riesgos         | Diferencias de soporte entre navegadores y complejidad de sincronización futura      | Dependencia de conectividad                | Mayor tiempo y mantenimiento entre plataformas               | Dependencia del framework y compatibilidad entre plataformas      |

## Decisión

Seleccionamos **PWA** como la estrategia de aplicación para este proyecto.

Esta alternativa satisface mejor las restricciones del proyecto porque:

- Puede instalarse en el dispositivo del técnico sin depender de una tienda de aplicaciones, lo cual simplifica la distribución dentro del alcance de 14 semanas.
- Se desarrolla con las mismas tecnologías web (Next.js) que ya proporciona el curso, sin necesidad de introducir un stack adicional ni duplicar desarrollo para distintas plataformas.
- Ofrece una ruta clara hacia el funcionamiento offline mediante Service Workers y almacenamiento local (IndexedDB, Cache API), lo cual responde directamente a la conectividad intermitente identificada como restricción central del proyecto.
- Su mantenimiento está centralizado en una sola base de código web, a diferencia de una aplicación nativa o multiplataforma que exigiría mantener versiones o frameworks adicionales.
- Es la trayectoria que ya define el curso, por lo que mantiene la reproducibilidad y el despliegue definidos desde el arranque del proyecto.

**Qué NO resuelve todavía esta decisión (Semana 1):**

- No se ha implementado el manifest ni el Service Worker.
- No existe todavía almacenamiento offline ni sincronización de datos.
- No hay notificaciones push implementadas.
- No hay autenticación implementada.

Estas capacidades se documentan como requisitos futuros (ver RF-06 y RF-07 en docs/requirements.md) y se incorporarán en semanas posteriores del curso, según corresponda a cada actividad.

## Consecuencias y riesgos

**Consecuencias positivas:**

- Distribución sencilla: los técnicos pueden acceder a la aplicación mediante una URL, sin depender de una tienda de aplicaciones.
- Una sola base de código web para todos los dispositivos (móvil y escritorio).
- Posibilidad de instalación en el dispositivo del técnico sin proceso de publicación.
- Ruta clara de evolución hacia funcionamiento offline mediante Service Workers y almacenamiento local.
- Menor costo de mantenimiento comparado con desarrollar y mantener aplicaciones nativas separadas para Android e iOS.

**Costos:**

- Será necesario implementar posteriormente almacenamiento offline (IndexedDB/Cache API).
- Será necesario implementar sincronización de datos cuando se recupere la conexión.
- Se requerirán pruebas en diferentes navegadores y dispositivos para confirmar consistencia del comportamiento offline.

**Riesgos técnicos:**

- Diferencias de soporte de Service Workers y APIs offline entre navegadores.
- Complejidad al implementar la lógica de sincronización (RF-07).
- Posibles conflictos de datos si una inspección se registra o edita en más de un dispositivo mientras no hay conexión.
- Limitaciones de almacenamiento local en dispositivos móviles más antiguos.

**Mitigaciones:**

- Probar la aplicación en distintos navegadores y dispositivos a medida que se implementen las capacidades offline.
- Mantener el uso exclusivo de datos sintéticos durante todo el desarrollo.
- Conservar comandos de instalación y ejecución reproducibles (`npm ci`, `npm run dev`, `npm run verify`).
- Definir reglas claras de sincronización antes de implementar RF-06 y RF-07.
- Validar el comportamiento offline de forma progresiva, semana a semana, en lugar de implementarlo todo de una vez.

## Validación

Esta decisión se revisará en semanas posteriores mediante la siguiente evidencia:

- Instalación exitosa de la PWA en un dispositivo móvil y en escritorio.
- Verificación del funcionamiento con conectividad intermitente (registrar una inspección sin conexión y confirmar que no se pierde).
- Confirmación de que los datos se almacenan localmente cuando no hay conexión (RF-06).
- Confirmación de que los datos se sincronizan correctamente al recuperar la conexión, sin duplicados (RF-07).
- Pruebas en distintos navegadores y dispositivos para verificar consistencia del comportamiento.
- Medición de tiempos de carga de la pantalla inicial (RNF-05).
- Ejecución reproducible del proyecto mediante `npm ci`, `npm run dev` y `npm run verify` en cada entrega semanal.

Ninguna de estas validaciones se ha ejecutado todavía en Semana 1; se documentan aquí como plan de verificación para las semanas correspondientes.
