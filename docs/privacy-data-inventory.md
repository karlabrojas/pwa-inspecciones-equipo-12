# Inventario de datos y privacidad

## Propósito y alcance

La PWA permite registrar inspecciones de mantenimiento y conservarlas en el dispositivo durante una interrupción de conectividad, para intentar sincronizarlas después. Este inventario refleja la implementación presente en `src/lib/data/inspections.ts`, `src/components/inspection-capture.tsx`, `src/lib/storage/indexed-db.ts`, `src/lib/sync/run-sync.ts`, `src/app/api/inspections/route.ts` y `public/sw.js`.

El proyecto debe operar exclusivamente con datos sintéticos. Los valores precargados se describen en el código como sintéticos; algunos campos contienen nombres e identificadores plausibles. La apariencia no permite verificar su origen. Antes de compartir o desplegar el proyecto, confirmar que todos son ficticios y reemplazar cualquier dato de origen dudoso. No incluir datos reales de alumnado, personal, proveedores, credenciales, imágenes ni expedientes.

## Inventario

| Categoría / campos | Naturaleza y ejemplo de contenido, siempre sintético | Finalidad | Dónde se procesa y almacena hoy | Acceso actual | Conservación actual y riesgos |
|---|---|---|---|---|---|
| Datos de inspección: `id`, `location`, `date`, `title`, `category`, `status`, `statusLabel`, `findings`, `summary`, `affectedScope`, `impact`, `priority`, `riskLevel` | Identificadores ficticios, nombres genéricos de laboratorios/espacios, fechas inventadas y descripciones de mantenimiento ficticias. | Identificar y consultar una observación; demostrar seguimiento de mantenimiento. | Fixture `src/lib/data/inspections.ts`; nuevas capturas en estado del navegador, IndexedDB y payload de sincronización; registros recibidos en memoria por la ruta API. GET de mismo origen puede quedar en runtime cache. | Cualquier persona que use el navegador ve el listado. La API GET de demostración entrega todos los elementos sin autenticación. No hay roles. | Fixtures mientras formen parte del código; IndexedDB persiste hasta borrado del sitio/perfil o limpieza manual; la memoria del servidor hasta reinicio; caché hasta invalidación de versión o limpieza del navegador. El esquema no define plazo o borrado selectivo. Riesgo de exposición de ubicación, condición operativa y datos obsoletos. |
| Datos que podrían relacionarse con una persona: `inspector`, `reporterIdentifier`, `responsibleArea`, `assignedTo`, `updates[].author`, `reporterConfirmed` | Nombres, identificadores institucionales y referencias a grupos que deben ser inventados. `responsibleArea` y `reporterConfirmed` pueden referirse a personas o funciones si se cargan valores reales. | En el modelo de demostración, representar quién reporta, atiende o confirma una incidencia. La captura actual solo solicita responsable como texto opcional; no necesita identidad verificada. | Fixtures; los campos que se heredan del fixture se guardan con la captura; IndexedDB/cola/API si forman parte del objeto enviado. | Mismo alcance sin restricciones que el registro principal; quien tenga el dispositivo o acceda al API GET puede verlos. | No hay política de retención específica. Si se sustituyen fixtures por datos reales, existe riesgo de identificación directa, asociación de una persona con una incidencia y exposición innecesaria de estudiantes o personal. Minimizar y evaluar si esos campos son estrictamente necesarios. |
| Fechas y metadatos técnicos: `reportedAt`, `detectedAt`, `resolvedAt`, `updates[].dateTime`, `createdAt`, `updatedAt`, `syncedAt`, `conflict.detectedAt`, `serverUpdatedAt` | Marcas de tiempo ISO generadas o inventadas; no deben contener actividad real. | Ordenar, dar seguimiento, detectar conflictos y mostrar el estado de sincronización. | Cliente, IndexedDB y payload; algunos valores enviados se guardan en la memoria del servidor. | Igual que el registro asociado. | Parte persiste con la inspección y no tiene caducidad implementada. Fechas exactas pueden permitir inferir horarios/actividad si se usan con datos reales. |
| Datos de sincronización: `operationId`, `idempotencyKey`, `attemptId`, `inspectionId`, tipo, estado, `attempts`, `lastAttemptAt`, `nextAttemptAt`, `lastError`, `version`, `serverVersion`, `deduplicationKey` | UUIDs generados localmente y estados técnicos; la clave de idempotencia no es autenticador ni secreto. La clave de deduplicación deriva de identificador/nombre del inspector o del reportante, fecha, ubicación, título y resumen. | Persistir operaciones offline, reintentar sin duplicar, hacer seguimiento de errores y detectar conflictos. | IndexedDB (`syncOperations` y `inspections`); la petición POST usa `Idempotency-Key`. | Cualquier código del mismo origen puede leer el almacenamiento; el endpoint de demo no valida titularidad. | Sin vencimiento; la operación conserva payload completo. La clave de deduplicación puede derivar información de reporte/persona y no debe considerarse anónima. |
| Contenido de adjuntos: `attachments` | En capturas nuevas siempre es una lista vacía. Fixtures pueden incluir una referencia de nombre de archivo sintética; no se suben archivos desde el formulario actual. | Campo previsto por el modelo para relacionar evidencia de inspección. | Fixture y objeto serializado. No hay carga/almacenamiento de archivos implementado en la captura. | Lo mismo que otros campos de fixtures. | No aplica conservación de archivo en la implementación presente. Si se agregan adjuntos, evaluar contenido, metadatos EXIF, rostros, documentos y ubicación antes de permitir su captura. |
| Identificadores locales y claves aleatorias | ID local basado en `crypto.randomUUID()` y UUID de cada operación; no se deriva de una cuenta real. | Distinguir inspecciones y operaciones sin duplicar. | Cliente e IndexedDB; clave de operación se envía al API. | Visible en almacenamiento local y petición; la API de demostración lo usa para deduplicar. | Persiste con la operación, sin vencimiento. No funciona como contraseña, token de acceso o prueba de identidad. |
| Datos de red y dispositivo | La aplicación consulta `navigator.onLine`; genera UUIDs y usa las capacidades del navegador disponibles. No hay captura de geolocalización ni cámara en el formulario. La plataforma/hosting puede tratar metadatos de red fuera del código de negocio. | Detectar conectividad y asignar IDs únicos. | Navegador, petición HTTP y plataforma de alojamiento. | Los metadatos de transporte dependerán del navegador y del proveedor; el proyecto no documenta logs de infraestructura. | No se establece conservación desde el código. Antes de despliegue real, inventariar logs, IPs, cookies, telemetría y metadatos tratados por el hosting. |

## Flujo de datos observado

1. El usuario captura laboratorio, título, responsable opcional y resumen opcional. Se construye una inspección usando una plantilla sintética; se reemplazan ciertos campos y se asignan listas vacías para adjuntos y actualizaciones.
2. `saveInspection()` valida que el título no esté vacío y escribe en una transacción de IndexedDB tanto la inspección como la operación pendiente. Esta validación no es una validación integral de todos los campos.
3. Sin conexión, los datos quedan en IndexedDB y permanecen visibles después de recargar. No se envían hasta recuperar conectividad.
4. Al sincronizar, `run-sync.ts` envía el tipo y el objeto completo como JSON a `/api/inspections`, con una clave de idempotencia. La ruta demostrativa valida presencia de la clave y que exista `inspection.id` tipo string; no valida usuario, rol ni todo el esquema.
5. La API de demostración guarda el registro en un `Map` en memoria y su GET devuelve el contenido completo. El `Map` se pierde al reiniciar el proceso y no ofrece retención duradera.
6. El Service Worker no cachea POST. Sin embargo, las respuestas GET del API pueden almacenarse en Cache API y servirse offline. La persistencia local del cliente no se borra al sincronizar.

## Finalidad, minimización y límites

- **Finalidad de demo:** probar captura local, funcionamiento offline, reintentos y sincronización sin duplicados. No es un sistema oficial de registro, expediente laboral ni plataforma de administración institucional.
- **Minimización:** la captura requiere título y laboratorio; responsable y resumen son opcionales. No captura cuentas, contraseñas, geolocalización, cámara ni archivos. El modelo sí contempla identificador del reportante y asignación, por lo que esos campos deben permanecer nulos o con valores sintéticos en esta etapa.
- **No usar datos reales:** el hecho de que los campos existan no es autorización para introducir información real. El contenido libre podría revelar incidentes, nombres, horarios o condiciones internas; usar texto ficticio y no sensible.
- **No hay anonimización garantizada:** IDs aleatorios y pseudónimos no convierten un registro en anónimo si se conserva el nombre, ubicación detallada, fechas, identificador o texto contextual.
- **Acceso y controles actuales:** no se implementan cuentas, permisos ni separación por rol; el listado presenta fixtures y la ruta GET no autentica. El acceso al dispositivo/perfil del navegador también puede exponer el almacenamiento offline.
- **Conservación/borrado:** no hay calendario, borrado automático, interfaz para borrar registros ni mecanismo de borrado del servidor. La persistencia local depende del navegador; la API demostrativa conserva en memoria hasta reinicio. Esto no es una política de conservación aceptable para datos personales reales.
- **Cifrado y transporte:** IndexedDB/Cache API no reciben cifrado propio de la aplicación. El código no configura TLS; HTTPS debe ser exigido por el alojamiento de producción y no puede asumirse a partir de este repositorio.
- **Adjuntos:** la captura actual no recibe archivos. Si se habilitan, primero definir minimización, metadatos, análisis de malware, almacenamiento autorizado y retención; no guardar fotografías identificables en caché por defecto.

## Contexto de un sujeto obligado mexicano

Si una institución pública mexicana decide usar la solución con datos reales, la autoridad/institución responsable deberá confirmar, con su área jurídica y de protección de datos, el régimen federal o local vigente que le corresponde y documentar el fundamento y las atribuciones para cada finalidad. La condición de sujeto obligado requiere un tratamiento distinto a una demo académica y no se satisface solo publicando este inventario.

Como referencia general, debe revisarse la **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO)** vigente, además de la legislación local y las demás disposiciones aplicables a la institución y al tratamiento concreto. La autoridad competente, las obligaciones específicas y el texto vigente deben confirmarse con asesoría jurídica institucional; este documento no presupone una jurisdicción ni sustituye esa revisión.

Como requisitos de diseño y gobernanza previos a cualquier uso real se deben evaluar, según jurisdicción y tratamiento concreto:

- Finalidad institucional determinada y necesidad de cada campo; limitar la recolección a lo indispensable.
- Aviso de privacidad aplicable, información clara a las personas y canal para ejercer los derechos que correspondan.
- Fundamento jurídico y reglas internas de acceso, uso, transferencias y responsabilidades; no asumir que el consentimiento es siempre la base aplicable.
- Calidad, exactitud, actualización, plazo de conservación y disposición/borrado conforme a la normativa y reglas archivísticas aplicables.
- Medidas administrativas, físicas y técnicas proporcionales; análisis de riesgos, gestión de incidentes y trazabilidad de accesos cuando proceda.
- Evaluación de impacto u otros instrumentos previos si el tratamiento, volumen, población o tecnología lo requiere según la normativa aplicable.
- Revisión de proveedores, alojamiento, ubicación y transferencias de datos, y contratos/controles institucionales correspondientes.

Este documento describe riesgos técnicos observables y recomendaciones; no constituye opinión jurídica, aviso de privacidad ni declaración de cumplimiento. El proyecto no implementa actualmente gestión de derechos, notificación de incidentes, registro de accesos, separación por usuario, calendario de conservación ni un procedimiento de eliminación.

## Riesgos de privacidad y respuesta propuesta

| Riesgo | Personas / interés afectado | Decisión de la versión actual | Acción antes de tratar datos reales |
|---|---|---|---|
| Fixtures plausibles confundidos con registros reales | Personal, estudiantes u otras personas asociadas por nombre/identificador | Mantener solo fixtures manifiestamente sintéticos; verificar origen y sustituir valores dudosos. | Aprobación del dataset sintético; revisión de fixtures y prueba automatizada que rechace valores no permitidos. |
| Exposición por dispositivo compartido o perdido | Persona identificada en reportes; institución | El almacenamiento offline se usa para la demo y no tiene protección por usuario. | Identidad institucional, acceso por rol, gestión del dispositivo, expiración, borrado y evaluación de cifrado/llaves. |
| Copias offline y caché que sobreviven al envío o cambio de usuario | Persona asociada al contenido; confidencialidad de operaciones | La persistencia facilita la continuidad, pero hoy no elimina datos sincronizados ni particiona cachés. | Definir retención; borrar al vencer el plazo/cerrar sesión; evitar caché de respuestas privadas y probar aislamiento de usuarios. |
| API de demostración abierta y GET global | Cualquier persona cuyos datos se incorporaran por error | La ruta se limita a prueba local con datos sintéticos; no se considera servicio institucional. | Sustituirla por backend con autenticación/autorización y pruebas de acceso, antes de cualquier red real. |
| Sobrecolección en campos libres o identificadores | Reportante, personas asignadas y población mencionada | Mantener resumen y responsable opcionales; no pedir identificador personal en captura. | Definir necesidad campo por campo; quitar identificadores no indispensables y orientar para no incluir datos de terceros. |
| Retención indefinida/local sin borrado explícito | Personas registradas y responsable del tratamiento | No hay plazo en la demo; el vacío es una limitación, no una política válida para producción. | Aprobar plazo por finalidad y obligaciones; implementar borrado verificable en IndexedDB, API, cache y respaldos. |

## Relación de controles y pruebas

Los comandos de pruebas se ejecutan desde la raíz del proyecto. “Existe” indica evidencia automatizada actual; “pendiente” es una prueba propuesta y todavía no implementada.

| Control de privacidad | Evidencia actual | Prueba actual | Verificación adicional requerida |
|---|---|---|---|
| Mantener la captura offline disponible sin mezclar ni duplicar registros | Guardado transaccional y SyncQueue con idempotencia | Existe: `npm test` (`tests/storage.spec.ts`, `tests/integration/offline-sync.spec.ts`, `tests/sync.spec.ts`); E2E: `npm run test:e2e` para persistencia y sincronización | Agregar escenario con datos sintéticos de dos perfiles/usuarios cuando exista autenticación. |
| No almacenar archivos adjuntos reales en esta versión | Formulario asigna `attachments: []`; no hay control de carga | Revisión de `src/components/inspection-capture.tsx`; no hay test específico de privacidad de adjuntos | Prueba que el formulario rechace/no exponga adjuntos hasta que exista política y almacenamiento aprobado. |
| No incluir secretos en Service Worker | Prueba de patrones sensibles sobre `public/sw.js` | Existe: `npm test` (`tests/service-worker-behavior.spec.ts`) | Ampliar CI a repo y bundle; probar detección con token señuelo aislado y confirmar que no aparece en artefactos. |
| No ejecutar texto de inspección como HTML | React renderiza valores como texto en las vistas revisadas | No existe prueba específica; `tests/rendering.spec.ts` no monta el DOM | Prueba E2E con texto HTML/JS señuelo y aserción de texto visible, ausencia de ejecución y ausencia de nodos/atributos ejecutables. |
| Evitar acceso no autorizado y exposición de respuesta privada | No implementado en la API de demostración | No existen pruebas de autenticación/autorización | Añadir pruebas API anónimas y por rol, con GET/POST permitidos y denegados, aislamiento de registros y validación de payload. |
| Limitar exposición de caché offline | POST no se almacena; GET API sí puede quedar cacheado | Existe comportamiento actual en `tests/service-worker-behavior.spec.ts` y `tests/offline.spec.ts`; prueba GET documenta persistencia, no seguridad | Una vez que el endpoint sea privado, probar que no se cachea o que hay partición/limpieza al logout y cambio de identidad. |
| Definir y ejecutar conservación/borrado | No hay TTL, borrado ni gestión por usuario | No existe prueba | Añadir pruebas de expiración y eliminación local/remota/cache, incluyendo reinicio y respaldos según backend. |
| Confirmar carácter sintético del dataset | Fixtures descritos como sintéticos, pero con cadenas plausibles | `tests/rendering.spec.ts` prueba estructura/IDs, no procedencia | Agregar revisión de dataset y prueba con lista de patrones/reglas aprobadas; no usar coincidencias automáticas como única garantía. |

### Comandos de referencia

- Pruebas unitarias e integración: `npm test`.
- Flujo de navegador: `npm run test:e2e`.
- La suite actual no verifica por sí sola el cumplimiento legal, la confidencialidad de IndexedDB, autorización, conservación, XSS real en navegador ni ausencia global de secretos.
