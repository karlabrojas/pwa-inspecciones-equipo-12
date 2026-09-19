# Estrategia de caché

## Objetivo

La estrategia de caché permite que la PWA mantenga disponibles los recursos necesarios cuando la conectividad sea intermitente o no esté disponible.

El Service Worker intercepta las solicitudes y utiliza diferentes estrategias de caché dependiendo del tipo de recurso solicitado.

## Estrategias utilizadas

La aplicación utiliza cuatro estrategias principales:

- **Cache First**
- **Stale While Revalidate**
- **Network First**
- **Network Only**

Cada estrategia tiene un propósito específico para evitar almacenar indiscriminadamente todas las respuestas.

---

## 1. Cache First

### Funcionamiento

La estrategia **Cache First** consulta primero la caché.

Si el recurso existe en caché, se devuelve directamente sin realizar una solicitud de red.

Si el recurso no existe en caché, se solicita desde la red y, cuando corresponde, se almacena para futuras solicitudes.

### Recursos

Se utilizará principalmente para recursos estáticos que cambian con poca frecuencia, por ejemplo:

- iconos de la PWA;
- archivos estáticos;
- recursos necesarios para la interfaz que hayan sido definidos explícitamente para la caché.

### Ventaja

Permite que los recursos previamente almacenados estén disponibles incluso cuando no existe conexión.

### Consideración

Los recursos almacenados mediante esta estrategia pueden permanecer desactualizados hasta que sean invalidados mediante una nueva versión de la caché.

---

## 2. Stale While Revalidate

### Funcionamiento

La estrategia **Stale While Revalidate** devuelve inmediatamente la versión disponible en caché cuando existe, mientras realiza una solicitud de red en segundo plano para obtener una versión actualizada.

Si no existe una versión en caché, se obtiene el recurso desde la red.

### Recursos

Se utilizará para recursos que pueden beneficiarse de una respuesta rápida, pero que también deben actualizarse periódicamente, por ejemplo:

- recursos estáticos de la interfaz;
- archivos que pueden cambiar entre versiones;
- recursos cuya actualización no necesita bloquear la respuesta inicial.

### Ventaja

Permite obtener una respuesta rápida desde la caché mientras se busca una versión actualizada en segundo plano.

### Consideración

La primera respuesta puede corresponder a una versión anterior del recurso.

---

## 3. Network First

### Funcionamiento

La estrategia **Network First** intenta obtener primero el recurso desde la red.

Si la solicitud tiene éxito, la respuesta puede almacenarse en caché para utilizarse posteriormente.

Si la red no está disponible, se utiliza la versión previamente almacenada en caché cuando exista.

### Recursos

Se utilizará para recursos cuyo contenido debe mantenerse actualizado cuando exista conectividad, pero que pueden tener una copia anterior como respaldo.

En este proyecto puede aplicarse a recursos de datos sintéticos de las inspecciones cuando estos sean obtenidos mediante solicitudes de red.

### Ventaja

Prioriza información actualizada cuando existe conectividad y proporciona un respaldo offline cuando la red falla.

### Consideración

Si no existe una respuesta previamente almacenada y no hay conexión, la solicitud no podrá satisfacerse mediante esta estrategia.

---

## 4. Network Only

### Funcionamiento

La estrategia **Network Only** siempre intenta obtener el recurso desde la red y no utiliza la caché como fuente de respuesta.

### Recursos

Se utilizará para solicitudes que no deben almacenarse en caché, especialmente:

- operaciones que requieran comunicación con el servidor;
- solicitudes que puedan contener información que no deba persistirse;
- recursos o acciones que requieran una respuesta directamente desde la red.

### Ventaja

Evita que información que no debe persistir termine almacenada en la caché del Service Worker.

### Consideración

Estas solicitudes requieren conectividad. Si la red no está disponible, la solicitud fallará.

---

## Tabla de decisión

| Recurso o solicitud                                  | Estrategia             | Motivo                                            |
| ---------------------------------------------------- | ---------------------- | ------------------------------------------------- |
| Recursos estáticos previamente definidos             | Cache First            | Priorizar disponibilidad offline                  |
| Recursos que deben actualizarse periódicamente       | Stale While Revalidate | Respuesta rápida y actualización en segundo plano |
| Datos sintéticos de inspecciones obtenidos de la red | Network First          | Priorizar datos actualizados y conservar respaldo |
| Solicitudes que no deben persistirse                 | Network Only           | Evitar almacenamiento en caché                    |

## Datos sensibles

No se deben almacenar indiscriminadamente en caché datos sensibles, credenciales, tokens, información privada ni información real de estudiantes.

El proyecto utiliza únicamente datos sintéticos.

Las solicitudes que no deban persistirse deben utilizar **Network Only** en lugar de almacenarse automáticamente.

## Actualización de la caché

Las cachés deben utilizar nombres o versiones controladas para permitir su invalidación cuando cambie la versión de los recursos.

Durante una actualización del Service Worker se debe evitar que la aplicación utilice una versión incompleta o corrupta de los recursos.

La eliminación de cachés antiguas debe realizarse de manera controlada durante la activación de una nueva versión.

## Funcionamiento sin conexión

Cuando la conectividad no esté disponible:

- **Cache First** puede responder con recursos previamente almacenados.
- **Stale While Revalidate** puede responder con una versión almacenada cuando exista.
- **Network First** puede utilizar una respuesta almacenada como respaldo.
- **Network Only** requiere conexión y puede fallar cuando la red no esté disponible.

La experiencia offline se limita a los recursos definidos explícitamente por estas estrategias.

## Limitaciones

La estrategia de caché no garantiza que toda la aplicación esté disponible sin conexión.

Los recursos que no hayan sido almacenados previamente y que requieran comunicación con un servidor no podrán recuperarse si no existe conectividad.

Por esta razón, la experiencia offline depende de los recursos definidos explícitamente en el Service Worker.

## Decisiones técnicas

- Se utiliza un Service Worker para controlar las solicitudes de la PWA.
- Se utilizan **Cache First, Stale While Revalidate, Network First y Network Only** según el tipo de recurso.
- Se mantiene una lista explícita de recursos que pueden precargarse.
- Se evita almacenar indiscriminadamente respuestas de red.
- Se utilizan versiones controladas para la invalidación de caché.
- El registro del Service Worker se realiza después de la carga de la página.
- Los errores de registro se registran en la consola sin bloquear la aplicación.
- Los datos del proyecto son sintéticos y no contienen información real de estudiantes.
