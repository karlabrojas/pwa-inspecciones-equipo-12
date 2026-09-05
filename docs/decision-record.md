# ADR-001 — Estrategia de aplicación

> Completa esta decisión en Semana 1. Una decisión no es solo una preferencia: relaciona restricciones, alternativas, consecuencias y una forma de validación.

## Estado

Propuesta — completar y fechar. 

## Contexto y restricciones

Explica la conectividad intermitente, el uso móvil, los datos sintéticos, el alcance de una materia de 14 semanas y la necesidad de despliegue reproducible.

## Alternativas consideradas

Compara como mínimo: PWA, web tradicional, aplicación nativa y solución multiplataforma. Considera instalación, offline, distribución, costo de desarrollo, mantenimiento, acceso a capacidades del dispositivo y riesgos.

¿Qué es una PWA?
Una PWA (Progressive Web App) es una aplicación web que utiliza tecnologías como Service Workers, almacenamiento local y capacidades de instalación para ofrecer una experiencia similar a la de una aplicación nativa, pudiendo funcionar parcialmente sin conexión y adaptarse a diferentes dispositivos.
Caracteristicas de las PWA:
* Se accede desde navegador, pero puede instalarse en el dispositivo
* Puede instalarse como aplicación sin una tienda
* Puede funcionar parcialmente sin Internet
* Puede almacenar datos localmente y sincronizarlos después
* Puede utilizar IndexedDB, Cache API, etc.
* Se pueden gestionar automáticamente mediante la aplicación web
* Puede soportar notificaciones push, dependiendo del navegador/SO
* No requiere publicar obligatoriamente en una tienda
* Se desarrolla con tecnologías web
* No necesariamente necesita internet o puede reducirse mediante estrategias offline-first

¿Qué es una web tradicional?
Una web tradicional es una aplicación o sitio que se ejecuta principalmente dentro de un navegador y depende del servidor y de una conexión a Internet para obtener o enviar información. A diferencia de una PWA, normalmente no incorpora mecanismos avanzados para funcionar sin conexión, instalarse como aplicación o sincronizar datos cuando se recupera la conectividad.

* Se accede principalmente desde el navegador
* No se instala como aplicación
* Generalmente requiere conexión
* Una petición puede fallar al perder conexión
* Puede utilizar almacenamiento local, pero normalmente con menor integración offline
* Se actualiza al cargar la página desde el servidor
* Tiene notificaciones push más limitadas
* No requiere tienda
* Se desarrolla con tecnologías web
* Dependede normalmente de internet


## Decisión

Selecciona una alternativa y justifica por qué satisface mejor las restricciones. Declara qué no resuelve todavía.

## Consecuencias y riesgos

Incluye consecuencias positivas, costos, riesgos técnicos y mitigaciones.

## Validación

Indica qué evidencia de código, prueba o medición permitirá revisar esta decisión en semanas posteriores.

