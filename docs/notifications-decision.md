# Decisión: notificaciones locales de inspecciones

## Alcance

La primera etapa usa la API `Notification` del navegador para avisos locales relacionados con inspecciones. La solicitud de permiso solo se ejecuta desde una acción explícita, como pulsar **Activar notificaciones**. Consultar el estado del permiso al abrir la pantalla no muestra el diálogo ni inicia una solicitud.

Los eventos disponibles para integrar son la sincronización correcta de una inspección y la asignación de una inspección. Cada evento solo intenta mostrar un aviso si el permiso ya está concedido; nunca solicita permiso por su cuenta. Los textos son genéricos y no incluyen nombres, identificadores ni otros datos personales.

## Fallback y errores

Si el navegador no soporta la API, el permiso está denegado o se produce un error al pedir permiso o crear la notificación, el cliente devuelve un resultado con un mensaje para la interfaz. El control presenta esos mensajes en línea con `role="status"` y `aria-live="polite"`. El error de notificación no debe propagarse al flujo que registra, asigna o sincroniza inspecciones.

## Pruebas

`tests/notifications.spec.ts` inyecta una implementación determinista de la API y cubre soporte, permisos `granted`/`default`/`denied`, solicitud explícita, creación de notificación y fallbacks por errores. No requiere permisos reales del navegador, red, servicios privados ni credenciales.

## Límites y evolución

Estos avisos son locales y se muestran mientras el código de la aplicación ejecuta el evento. No son notificaciones push en segundo plano y no garantizan avisar con la pestaña cerrada. El proyecto aún no conecta la cola de sincronización con el cliente ni tiene un flujo de asignación; esos puntos deben invocar `showInspectionNotification` tras confirmar el evento correspondiente. La etapa push requerirá suscripción, manejo de eventos en el Service Worker y un servidor emisor; no forma parte de esta implementación.
