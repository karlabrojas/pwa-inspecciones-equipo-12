# Capacidades del dispositivo y notificaciones — Semana 6

Este documento describe las capacidades opcionales de la PWA de inspecciones: cámara, geolocalización y notificaciones locales. Las tres son **opcionales**: si el navegador no las ofrece, el usuario rechaza el permiso o ocurre un error, el flujo principal de inspecciones sigue funcionando.

## Resumen

| Capacidad       | Archivo                           | API del navegador                          | Se solicita cuando                                                                  |
| --------------- | --------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Cámara          | `src/lib/device/camera.ts`        | `navigator.mediaDevices.getUserMedia`      | Solo al llamar `requestCamera()`                                                    |
| Geolocalización | `src/lib/device/geolocation.ts`   | `navigator.geolocation.getCurrentPosition` | Solo al llamar `requestGeolocation()`                                               |
| Notificaciones  | `src/lib/notifications/client.ts` | `Notification`                             | Solo al llamar `requestNotificationPermission()` (botón **Activar notificaciones**) |

Cargar los módulos no solicita ningún permiso (hay pruebas que lo verifican para cámara y geolocalización). Consultar el estado del permiso de notificaciones (`getNotificationPermissionState`) tampoco abre ningún diálogo.

## Decisiones y trade-offs

| Decisión                                                                                                                           | Alternativa descartada                                          | Motivo y costo                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Las funciones **devuelven un resultado tipado** (`ok` / `reason` / `status`) y no lanzan.                                          | Lanzar excepciones y capturarlas en cada pantalla.              | El llamador está obligado a decidir qué hacer en cada caso y el flujo principal nunca se interrumpe. Costo: cada pantalla debe manejar la rama de fallo.                                                                         |
| **Permisos mínimos**: cámara solo con video; ubicación de baja precisión, con posición reutilizable hasta 5 min y timeout de 10 s. | Pedir audio, o alta precisión "por si acaso".                   | Menos datos sensibles y menos fricción. Costo: la ubicación puede tener un error de cientos de metros, insuficiente para ubicar un equipo dentro de un edificio.                                                                 |
| **Notificaciones locales** con el constructor `Notification`.                                                                      | Push real con Service Worker y `registration.showNotification`. | Es mucho más simple, no requiere servidor push ni claves VAPID y permite probarlo con una API simulada. Costo: no avisa con la pestaña cerrada y falla en navegadores donde el constructor no está permitido (ver limitaciones). |
| El permiso de notificaciones se pide **solo** desde un botón; los avisos por evento nunca lo piden.                                | Pedirlo al cargar o al primer evento.                           | Evita el diálogo sin contexto, que suele terminar en denegación permanente. Costo: el usuario debe activar las notificaciones de forma explícita.                                                                                |
| Los avisos usan **texto genérico** y `tag` por tipo de evento.                                                                     | Incluir el nombre o identificador de la inspección.             | No expone datos en la pantalla bloqueada. Costo: dos avisos del mismo tipo seguidos se reemplazan en lugar de acumularse.                                                                                                        |
| La Permissions API (`navigator.permissions.query`) **no se usa**.                                                                  | Consultar el estado antes de pedir.                             | Su soporte varía entre navegadores y duplica la lógica. Costo: no se puede distinguir "no preguntado" de "denegado" en cámara y ubicación hasta intentarlo.                                                                      |

## Permisos mínimos

- **Cámara:** solo video (`video: true`, `audio: false`). No se solicita micrófono. `stopCamera(stream)` detiene todas las pistas del stream.
- **Geolocalización:** baja precisión (`enableHighAccuracy: false`), reutiliza una posición de hasta 5 minutos (`maximumAge: 300000`) y espera como máximo 10 segundos (`timeout: 10000`).
- **Notificaciones:** el permiso se pide solo si el estado actual es `default`. Si ya es `granted` o `denied`, no se vuelve a preguntar. Los avisos por evento (`showInspectionNotification`) nunca piden permiso: solo muestran el aviso si ya fue concedido.

## Privacidad y datos recolectados

- Las funciones de cámara y geolocalización no guardan ni envían nada: devuelven el resultado a quien las llama. El stream de la cámara solo existe en memoria hasta que se detiene.
- Las coordenadas devueltas por la geolocalización son datos sensibles. Quien integre esta capacidad a un flujo debe decidir qué guardar y guardar solo lo necesario (por ejemplo, latitud, longitud y precisión, sin el objeto completo).
- Los avisos de notificación usan texto genérico, sin nombres, identificadores ni datos personales (hay una prueba que lo verifica: ningún aviso contiene dígitos ni correos).
- Las pruebas usan únicamente datos sintéticos y APIs simuladas. No dependen de servicios externos, credenciales ni claves privadas.

## Fallback

Las funciones devuelven un resultado en lugar de lanzar excepciones, de modo que el flujo principal puede continuar sin evidencia o sin aviso. Esto incluye la ejecución fuera de un navegador (por ejemplo, el render en servidor de Next.js), donde `navigator` no existe: ambas funciones de dispositivo devuelven `reason: "unsupported"`.

| Situación                           | Cámara                                                              | Geolocalización                                                                       | Notificaciones                                              |
| ----------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| API inexistente (o sin `navigator`) | `reason: "unsupported"`                                             | `reason: "unsupported"`                                                               | `status: "unsupported"`                                     |
| Permiso denegado                    | `reason: "permission-denied"` (`NotAllowedError` o `SecurityError`) | `reason: "permission-denied"` (código 1)                                              | `status: "denied"`                                          |
| Otro fallo                          | `reason: "error"` (conserva el error original)                      | `reason: "error"` (códigos 2 y 3, p. ej. timeout, o una excepción síncrona de la API) | `status: "error"` (p. ej. el constructor no está permitido) |
| Permiso aún en `default`            | No aplica                                                           | No aplica                                                                             | `status: "permission-required"` en avisos por evento        |

La interfaz de notificaciones muestra el mensaje del resultado con `role="status"` y `aria-live="polite"`.

## Cómo se prueban

- `tests/capabilities.spec.ts` (24 pruebas): cámara y geolocalización disponibles, no soportadas (con y sin `navigator`), permiso denegado y errores; que cargar los módulos no solicita acceso; notificaciones con permiso concedido, denegado, rechazado en la solicitud, sin API y con constructor que lanza; que los avisos son genéricos; y que el flujo principal (encolar una inspección) continúa cuando ninguna capacidad está disponible.
- `tests/notifications.spec.ts` (8 pruebas): estados de permiso, solicitud explícita, avisos por evento y errores.
- Son deterministas: reemplazan `navigator` temporalmente con `try/finally` (de modo que se restaura aunque falle una aserción) o inyectan una API de notificaciones falsa. No usan red, temporizadores reales ni permisos reales del navegador.

## Supuestos

- Para ejecutar las pruebas en local se necesita Node.js con soporte de `--experimental-strip-types` (22.6 o superior). El workflow de GitHub Actions del repositorio instala dependencias, compila y ejecuta la suite.
- Un navegador moderno servido por HTTPS o `localhost`.
- Los permisos pueden cambiar en cualquier momento desde la configuración del navegador.

## Errores conocidos y limitaciones

- Cámara y geolocalización existen como funciones; la cámara devuelve un stream, no captura ni adjunta una foto a la inspección. Mientras no estén conectadas a una pantalla, el fallback visible para el usuario (selector de archivo, captura manual de ubicación) no existe.
- Los avisos por evento (`showInspectionNotification`) solo se invocan desde los flujos que los conecten; hoy el único punto de interfaz conectado es el botón **Activar notificaciones**.
- Las notificaciones son locales, no push: no garantizan avisar con la pestaña cerrada. En algunos navegadores móviles (p. ej. Chrome en Android) el constructor `Notification` no está permitido y se requiere el Service Worker; en ese caso el cliente devuelve `status: "error"`. En iOS las notificaciones web solo están disponibles para una PWA instalada en la pantalla de inicio.
- Un contexto inseguro (sin HTTPS) lanza `SecurityError` en la cámara, que se reporta como `permission-denied` aunque el usuario no haya rechazado nada. En geolocalización, un origen inseguro también suele llegar como código 1.
- En geolocalización, el `timeout` de 10 s solo corre después de que el usuario responde al diálogo de permiso. Si lo ignora, la promesa queda pendiente; la interfaz debe permitir continuar sin esperar la ubicación.
- El navegador Safari antiguo usa la forma con callback de `Notification.requestPermission()`, que no devuelve una promesa; ahí el resultado cae en `permission-required`.
- Las pruebas no se ejecutan en un navegador real, así que no verifican el diálogo de permisos ni el comportamiento entre navegadores, ni demuestran a nivel de interfaz que la página no pida permisos al cargar.
- `npm ci` reporta 3 vulnerabilidades en dependencias (2 altas, 1 crítica). No se aplicó `npm audit fix --force` porque puede introducir cambios incompatibles con Next.js.

## Evidencia reproducible

```bash
npm ci
npm test
make verify
```

`make verify` genera `reports/verification.json`. El resultado de GitHub Actions y la evidencia individual están en `evidence/individual.md`.
