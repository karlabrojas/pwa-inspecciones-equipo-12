# Requisitos del producto — completar en Semana 1

> Conserva estos encabezados y reemplaza las instrucciones por tu análisis. No uses datos reales.

## 1. Problema y contexto

Describe qué problema de inspecciones de mantenimiento se quiere resolver, en qué contexto de conectividad y qué queda fuera del alcance.

1.¿Qué problema tienen las inspecciones de mantenimiento?

Las inspecciones de mantenimiento de los laboratorios y salones de clase pueden presentar problemas relacionados con el registro, seguimiento y disponibilidad de la información. Al realizar una inspección, el técnico necesita registrar qué espacio revisó, la fecha, una descripción de lo encontrado y, cuando existen problemas, el número de incidencias o hallazgos detectados.

Si estos registros se realizan de manera manual o dependen completamente de una conexión a Internet, pueden ocurrir situaciones como:

* Pérdida de información al no poder guardar un reporte.
* Dificultad para registrar una inspección cuando no hay Internet.
* Información desactualizada o dispersa.
* Dificultad para consultar inspecciones anteriores.
* Falta de seguimiento de las incidencias encontradas.
* Duplicación de reportes cuando una persona intenta enviar nuevamente una inspección que aparentemente no se había guardado.

Problema principal: se necesita un mecanismo que permita registrar y conservar las inspecciones de mantenimiento de forma confiable, incluso cuando la conexión a Internet no sea estable.

2.¿Quién necesita registrar las inspecciones?

Principalmente, los técnicos responsables de los laboratorios y salones de clase.

Cada técnico puede ser responsable de uno o varios espacios y, durante sus recorridos de mantenimiento, debe poder registrar:

* Laboratorio o salón inspeccionado.
* Fecha de la inspección.
* Descripción de la revisión.
* Hallazgos o incidencias encontradas.
* Cantidad de hallazgos.
* Estado de la inspección, por ejemplo, "Sin incidencias" o "Requiere atención".

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

* Centralizar los registros de inspecciones.
* Facilitar el registro de incidencias y hallazgos.
* Identificar rápidamente qué espacios requieren atención.
* Conservar la información aunque temporalmente no exista Internet.
* Sincronizar los registros cuando se recupere la conexión.
* Reducir la pérdida o duplicación de información.
* Facilitar la consulta del historial de inspecciones.
* Mostrar de manera clara el estado de cada espacio.

5.¿Qué puede quedar fuera del alcance?

Para evitar que el proyecto crezca demasiado, se establecen algunas funcionalidades que no serán responsabilidad de la primera versión.

Por ejemplo:

* Mantenimiento predictivo: el sistema no determinará automáticamente cuándo un equipo va a fallar.
* Diagnóstico automático: la aplicación registrará los problemas, pero no determinará técnicamente cómo repararlos.
* Gestión completa de inventario: no necesariamente llevará el control de todas las computadoras, proyectores, cables, herramientas, etc.
* Asignación automática de técnicos: no se encargará de distribuir las inspecciones entre los técnicos.
* Control de asistencia: registrar una inspección no significa registrar la entrada o salida laboral del técnico.
* Sistema avanzado de notificaciones: puede quedar fuera el envío de SMS, WhatsApp o notificaciones externas.
* Integración con otros sistemas institucionales: inicialmente puede funcionar de manera independiente.
* Edición avanzada de fotografías/documentos: si posteriormente se agregan evidencias fotográficas, las funciones avanzadas de procesamiento pueden quedar fuera.
* Reportes estadísticos avanzados: la primera versión puede limitarse al registro, consulta y conteo básico de incidencias.

La PWA registra y administra la información de las inspecciones, pero no sustituye el trabajo técnico ni determina las acciones de reparación.

## 2. Usuarios y escenarios

Identifica los usuarios principales y escribe al menos dos escenarios observables, incluyendo uno con conectividad intermitente.

## 3. Requisitos funcionales

Escribe requisitos numerados con formato verificable (por ejemplo, RF-01). Cada requisito debe incluir una condición de aceptación.

## 4. Requisitos no funcionales

Incluye requisitos medibles de reproducibilidad, accesibilidad, seguridad, privacidad, rendimiento y operación offline futura.

## 5. Datos sintéticos y límites

Explica qué datos se usarán para la actividad y qué información está prohibida.

## 6. Criterios de aceptación de la Semana 1

Relaciona cada entrega con una prueba o comando que permita verificarla.

