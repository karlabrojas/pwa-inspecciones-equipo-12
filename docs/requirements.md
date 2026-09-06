# Requisitos del producto — completar en Semana 1

> Conserva estos encabezados y reemplaza las instrucciones por tu análisis. No uses datos reales.

## 1. Problema y contexto

Describe qué problema de inspecciones de mantenimiento se quiere resolver, en qué contexto de conectividad y qué queda fuera del alcance.

1.¿Qué problema tienen las inspecciones de mantenimiento?

Las inspecciones de mantenimiento de los laboratorios y salones de clase pueden presentar problemas relacionados con el registro, seguimiento y disponibilidad de la información. Al realizar una inspección, el técnico necesita registrar qué espacio revisó, la fecha, una descripción de lo encontrado y, cuando existen problemas, el número de incidencias o hallazgos detectados.

Si estos registros se realizan de manera manual o dependen completamente de una conexión a Internet, pueden ocurrir situaciones como:

- Pérdida de información al no poder guardar un reporte.
- Dificultad para registrar una inspección cuando no hay Internet.
- Información desactualizada o dispersa.
- Dificultad para consultar inspecciones anteriores.
- Falta de seguimiento de las incidencias encontradas.
- Duplicación de reportes cuando una persona intenta enviar nuevamente una inspección que aparentemente no se había guardado.

Problema principal: se necesita un mecanismo que permita registrar y conservar las inspecciones de mantenimiento de forma confiable, incluso cuando la conexión a Internet no sea estable.

2.¿Quién necesita registrar las inspecciones?

Principalmente, los técnicos responsables de los laboratorios y salones de clase.

Cada técnico puede ser responsable de uno o varios espacios y, durante sus recorridos de mantenimiento, debe poder registrar:

- Laboratorio o salón inspeccionado.
- Fecha de la inspección.
- Descripción de la revisión.
- Hallazgos o incidencias encontradas.
- Cantidad de hallazgos.
- Estado de la inspección, por ejemplo, "Sin incidencias" o "Requiere atención".

Por ejemplo:
El Técnico B realiza una inspección en el Laboratorio de Electrónica y encuentra dos problemas. Registra la inspección, agrega una descripción de los hallazgos y el sistema marca automáticamente el registro como "Requiere atención".

También puede existir un usuario administrativo que consulte y supervise los registros, aunque no necesariamente sea quien realiza las inspecciones.

3.¿Por qué la conectividad intermitente es importante en este proyecto?

Es importante porque los técnicos pueden realizar las inspecciones dentro de laboratorios, salones, talleres u otras áreas donde la conexión Wi-Fi o los datos móviles no siempre sean estables.

La aplicación no debería depender completamente de tener Internet en el momento exacto en que se realiza una inspección.

Por eso, uno de los objetivos de la PWA seria implementar un funcionamiento offline-first. Los datos de una inspección podrían almacenarse temporalmente en el dispositivo mediante tecnologías como IndexedDB y posteriormente sincronizarse con el servidor cuando vuelva la conexión.

Esto es especialmente importante porque tener conectividad intermitente no debería provocar que el técnico pierda una inspección ya realizada.

4.¿Qué se pretende solucionar con este proyecto?

El proyecto pretende desarrollar una PWA para registrar y consultar inspecciones de mantenimiento de laboratorios y salones de clase, permitiendo que los técnicos puedan trabajar incluso ante problemas de conectividad.

Se busca:

- Centralizar los registros de inspecciones.
- Facilitar el registro de incidencias y hallazgos.
- Identificar rápidamente qué espacios requieren atención.
- Conservar la información aunque temporalmente no exista Internet.
- Sincronizar los registros cuando se recupere la conexión.
- Reducir la pérdida o duplicación de información.
- Facilitar la consulta del historial de inspecciones.
- Mostrar de manera clara el estado de cada espacio.

  5.¿Qué puede quedar fuera del alcance?

Para evitar que el proyecto crezca demasiado, se establecen algunas funcionalidades que no serán responsabilidad de la primera versión.

Por ejemplo:

- Mantenimiento predictivo: el sistema no determinará automáticamente cuándo un equipo va a fallar.
- Diagnóstico automático: la aplicación registrará los problemas, pero no determinará técnicamente cómo repararlos.
- Gestión completa de inventario: no necesariamente llevará el control de todas las computadoras, proyectores, cables, herramientas, etc.
- Asignación automática de técnicos: no se encargará de distribuir las inspecciones entre los técnicos.
- Control de asistencia: registrar una inspección no significa registrar la entrada o salida laboral del técnico.
- Sistema avanzado de notificaciones: puede quedar fuera el envío de SMS, WhatsApp o notificaciones externas.
- Integración con otros sistemas institucionales: inicialmente puede funcionar de manera independiente.
- Edición avanzada de fotografías/documentos: si posteriormente se agregan evidencias fotográficas, las funciones avanzadas de procesamiento pueden quedar fuera.
- Reportes estadísticos avanzados: la primera versión puede limitarse al registro, consulta y conteo básico de incidencias.

La PWA registra y administra la información de las inspecciones, pero no sustituye el trabajo técnico ni determina las acciones de reparación.

## 2. Usuarios y escenarios

Identifica los usuarios principales y escribe al menos dos escenarios observables, incluyendo uno con conectividad intermitente.

### Usuarios Principales

**Técnico de mantenimiento:** Usuario principal de la PWA. Reliza inspecciones en laboratorios y salones de clase y registra la información correspondiente a cada revisión, incluyendo el espacio inspeccionado, la fecha, la descripción y los hallazgos encontrados.

**Usuario administrativo o responsable de mantenimiento:** Usuario encargado de consultar los registros de inspecciones y revisar qué espacios presentan incidencias o requieren atención. Su función principal es la consulta y seguimiento de la información registrada.

### Escenario 1 — Registro de una inspección sin incidencias

**Situación inicial:** Un técnico realiza una revisión de mantenimiento en un laboratorio y dispone de conexión a Internet. Durante la inspección no encuentra problemas.

**Acción:** El técnico selecciona el laboratorio correspondiente, registra la fecha, describe la revisión y registra que no encontró hallazgos o incidencias.

**Resultado esperado:** El sistema conserva el registro de la inspección y determina automáticamente el estado como **"Sin incidencias"** debido a que no se registraron hallazgos.

**Requisitos relacionados:** RF-01, RF-02, RF-03, RF-04 y RF-05.

### Escenario 2 — Registro de una inspección con hallazgos

**Situación inicial:** Un técnico inspecciona un laboratorio y encuentra varios problemas de mantenimiento.

**Acción:** El técnico registra el espacio inspeccionado, la fecha, una descripción de la revisión y los hallazgos encontrados, incluyendo la cantidad de incidencias detectadas.

**Resultado esperado:** El sistema conserva la información registrada y determina automáticamente el estado como **"Requiere atención"** cuando existe al menos un hallazgo o incidencia.

**Requisitos relacionados:** RF-01, RF-02, RF-03, RF-04 y RF-05.

### Escenario 3 — Inspección con conectividad intermitente

**Situación inicial:** Un técnico realiza una inspección dentro de un laboratorio donde la conexión a Internet es inestable o se pierde temporalmente.

**Acción:** El técnico captura los datos de la inspección aunque en ese momento no exista una conexión estable.

**Resultado esperado futuro:** La PWA deberá conservar temporalmente la información en el dispositivo y permitir su sincronización cuando se recupere la conectividad, evitando que el técnico tenga que volver a capturar la inspección.

**Requisitos relacionados:** RF-06 y RF-07.

**Nota:** Este comportamiento corresponde a una capacidad futura del producto.

### Escenario 4 — Consulta de inspecciones anteriores

**Situación inicial:** Un responsable de mantenimiento necesita revisar las inspecciones registradas anteriormente para conocer el estado de un laboratorio.

**Acción:** El usuario consulta los registros disponibles y revisa la información de las inspecciones realizadas.

**Resultado esperado:** El sistema muestra los registros disponibles con información suficiente para identificar el espacio inspeccionado, la fecha, los hallazgos y el estado de la inspección.

**Requisitos relacionados:** RF-08 y RF-09.

## 3. Requisitos funcionales

Escribe requisitos numerados con formato verificable (por ejemplo, RF-01). Cada requisito debe incluir una condición de aceptación.

### RF-01 — Identificación del espacio inspeccionado

**Descripción:** El sistema deberá permitir registrar el laboratorio o salón de clase en el que se realiza una inspección.

**Escenarios relacionados:** Escenario 1 y Escenario 2.

**Condición de aceptación:** Al registrar una inspección con un espacio válido, el registro deberá conservar el espacio seleccionado y mostrarlo posteriormente de forma identificable.

### RF-02 — Registro de fecha de inspección

**Descripción:** El sistema deberá permitir asociar una fecha a cada inspección registrada.

**Escenarios relacionados:** Escenario 1 y Escenario 2.

**Condición de aceptación:** Al guardar una inspección con una fecha válida, el registro deberá conservar y mostrar la misma fecha asociada a la inspección.

### RF-03 — Registro de descripción de la inspección

**Descripción:** El sistema deberá permitir registrar una descripción de la revisión realizada.

**Escenarios relacionados:** Escenario 1 y Escenario 2.

**Condición de aceptación:** Al guardar una descripción válida, el registro deberá conservar el texto introducido y permitir consultarlo posteriormente.

### RF-04 — Determinación automática del estado

**Descripción:** El sistema deberá determinar automáticamente el estado de una inspección a partir de la cantidad de hallazgos o incidencias registradas.

**Escenarios relacionados:** Escenario 1 y Escenario 2.

**Condición de aceptación:** Cuando la cantidad de hallazgos sea igual a cero, el sistema deberá mostrar el estado **"Sin incidencias"**. Cuando exista al menos un hallazgo, deberá mostrar el estado **"Requiere atención"**, sin que el usuario tenga que seleccionar manualmente el estado.

### RF-05 — Registro de hallazgos e incidencias

**Descripción:** El sistema deberá permitir registrar los hallazgos o incidencias encontrados durante una inspección y su cantidad correspondiente.

**Escenarios relacionados:** Escenario 1 y Escenario 2.

**Condición de aceptación:** Al registrar una inspección, el sistema deberá conservar la cantidad y descripción de los hallazgos introducidos. Una cantidad de cero deberá permitir determinar el estado como **"Sin incidencias"**, mientras que una cantidad mayor que cero deberá permitir determinarlo como **"Requiere atención"**.

### RF-06 — Conservación temporal de inspecciones sin conexión

**Descripción:** Como requisito futuro del producto, la PWA deberá permitir conservar temporalmente una inspección en el dispositivo cuando no exista conexión a Internet.

**Escenario relacionado:** Escenario 3.

**Condición de aceptación futura:** Al registrar una inspección sin conexión, los datos deberán permanecer disponibles en el dispositivo y no perderse al recuperar posteriormente la conectividad.

**Prioridad:** Requisito futuro.

### RF-07 — Sincronización posterior de inspecciones

**Descripción:** Como requisito futuro del producto, la PWA deberá sincronizar con el servidor las inspecciones almacenadas temporalmente cuando se recupere la conectividad.

**Escenario relacionado:** Escenario 3.

**Condición de aceptación futura:** Una inspección almacenada durante un periodo sin conexión deberá enviarse al servidor al recuperar una conexión disponible y deberá evitarse la creación de registros duplicados.

**Prioridad:** Requisito futuro.

### RF-08 — Consulta de inspecciones registradas

**Descripción:** El sistema deberá permitir consultar las inspecciones que hayan sido registradas.

**Escenario relacionado:** Escenario 4.

**Condición de aceptación:** Al acceder a la consulta de inspecciones, el sistema deberá mostrar los registros disponibles con al menos el espacio inspeccionado, la fecha y el estado de la inspección.

### RF-09 — Consulta de hallazgos y estado

**Descripción:** El sistema deberá permitir consultar los hallazgos registrados y el estado determinado para cada inspección.

**Escenario relacionado:** Escenario 4.

**Condición de aceptación:** Al consultar una inspección, el sistema deberá mostrar los hallazgos registrados y su estado correspondiente, permitiendo distinguir entre **"Sin incidencias"** y **"Requiere atención"**.

## 4. Requisitos no funcionales

Incluye requisitos medibles de reproducibilidad, accesibilidad, seguridad, privacidad, rendimiento y operación offline futura.

## 5. Datos sintéticos y límites

Explica qué datos se usarán para la actividad y qué información está prohibida.

## 6. Criterios de aceptación de la Semana 1

Relaciona cada entrega con una prueba o comando que permita verificarla.
