# Politica de sincronizacion y resolucion de conflictos

Documenta el comportamiento de `src/lib/storage/schema.ts`, `src/lib/sync/queue.ts`
y `src/lib/sync/conflict-policy.ts`, verificado en `tests/sync.spec.ts`.

## 1. Que constituye un conflicto

Un conflicto ocurre cuando se cumplen **las dos** condiciones:

1. La version del servidor avanzo desde la ultima vez que el cliente la conocio
   (`remoteVersion > localKnownServerVersion`, o el cliente nunca la conocio).
2. El contenido local y el remoto son **distintos** entre si.

Si el servidor avanzo pero el contenido es identico al que el cliente ya tiene,
no se marca conflicto: no hay nada que resolver. Esto evita falsos positivos
cuando el servidor solo reenvia la misma informacion.

## 2. Como se detecta

`detectConflict()` en `conflict-policy.ts` compara:

- `localKnownServerVersion` contra `remoteVersion` (deteccion de version adelantada).
- El contenido completo de la inspeccion local contra la remota, por valor
  (no por referencia), para distinguir un avance de version sin cambios reales
  de un conflicto real.

Prueba: `tests/sync.spec.ts` — "conflicto: cambios locales y remotos distintos
se detectan..." y "conflicto: si el remoto avanzo pero el contenido es
igual, no se marca conflicto".

## 3. Que version prevalece

La politica por defecto es **`manual`**: ninguna version se descarta
automaticamente. Se conserva el contenido **local** (no se sobrescribe con el
remoto) y se guarda un registro `InspectionConflict` con `detectedAt`,
`serverVersion`, `serverUpdatedAt` y `resolutionPolicy`, para que una persona
decida que hacer.

El tipo `ConflictResolutionPolicy` (`schema.ts`) tambien admite `local-wins` y
`server-wins` para casos donde el equipo decida automatizar la resolucion en
el futuro, pero **esta semana el valor usado es `manual`**.

### Por que `manual` y no automatico

Una inspeccion de laboratorio es un reporte de seguridad: sobrescribir un
cambio local con uno remoto (o viceversa) sin que nadie lo revise puede borrar
una observacion real. El costo de pedir una revision manual es menor que el
riesgo de perder informacion de un reporte.

## 4. Como se evita perder informacion

Al detectarse un conflicto, `resolveConflict()` con politica `manual` devuelve
el contenido **local** sin modificarlo, y el llamador debe guardarlo con
`syncStatus: "conflict"` (definido en `schema.ts`) en vez de `"synced"`. El
cambio remoto no se descarta: queda identificado en `conflict.serverVersion` y
`conflict.serverUpdatedAt`, disponible para quien resuelva el conflicto.

## 5. Operaciones repetidas (duplicacion e idempotencia)

- **Duplicacion al encolar:** `SyncQueue.enqueue()` usa `operationId` como
  clave. Si ya existe una operacion con ese id, no crea una segunda; devuelve
  la existente. Prueba: "duplicacion: encolar dos veces el mismo
  operationId no crea una segunda operacion".
- **Idempotencia al procesar:** una operacion con estado `completed` ya no
  aparece en `getPending()` (solo se consideran `pending` y `failed`), asi que
  `process()` nunca vuelve a invocar el handler para una operacion ya
  completada. Prueba: "idempotencia: procesar dos veces la misma operacion
  completada no la vuelve a enviar".

## 6. Respuestas fuera de orden

Cada intento de envio recibe un `attemptId` nuevo. Antes de marcar una
operacion como `completed` o `failed`, `SyncQueue` comprueba que el estado
guardado siga siendo `processing` **con ese mismo `attemptId`**. Si otro
proceso (por ejemplo, otra pestana trabajando sobre el mismo almacenamiento)
ya avanzo la operacion con un `attemptId` distinto, la respuesta tardia se
descarta en silencio (se cuenta como `skipped`, no como error).

Prueba: "respuestas fuera de orden: la respuesta de un intento viejo no
sobrescribe un intento mas nuevo" (simula dos pestanas sobre el mismo
almacenamiento).

## 7. Errores de red (reintentos)

Si el handler de sincronizacion lanza un error, la operacion pasa a
`failed` con el mensaje guardado en `lastError`. `getPending()` incluye las
operaciones `failed`, asi que una llamada posterior a `process()` las vuelve a
intentar automaticamente. Prueba: "reintentos: un error temporal marca
failed y una llamada posterior reintenta y completa".

## 8. Concurrencia dentro de una misma pestana

`SyncQueue.process()` usa un candado interno (`processLock`) para serializar
llamadas concurrentes sobre la misma instancia: si se llama `process()` dos
veces en paralelo, la segunda espera a que la primera termine antes de leer
las operaciones pendientes. Esto evita que una misma operacion se envie dos
veces por una doble invocacion accidental.

**Regresion verificada:** `tests/sync.spec.ts` incluye una prueba que falla si
se quita este candado (demostrado manualmente: al comentar la serializacion,
el handler se ejecuta 2 veces en vez de 1 y la prueba
`regresion: sin el candado processLock...` falla).

## 9. Persistencia y cierre/reapertura

`SyncQueue` no guarda estado propio de las operaciones; todo vive en el
`QueueStorage` que recibe por parametro (en produccion, IndexedDB via
`createSyncQueueStorage()` en `indexed-db.ts`). Crear una instancia nueva de
`SyncQueue` sobre el mismo almacenamiento (equivalente a cerrar y reabrir la
pestana) conserva las operaciones pendientes. Prueba: "persistencia
offline: una operacion encolada sigue disponible tras cerrar y reabrir la
app".

## 10. Caso de conflicto reproducido (segun lo pedido en el Issue #25)
Verificado en `tests/sync.spec.ts`, prueba "conflicto: cambios locales y
remotos distintos se detectan y no se pierde el cambio local".

## 11. Limites de la solucion

- La resolucion automatica (`local-wins` / `server-wins`) esta definida en el
  tipo pero no se usa por defecto; si el equipo decide activarla mas adelante,
  debe documentarse por que ese caso especifico justifica automatizar.
- `detectConflict()` compara el objeto `Inspection` completo. Un cambio en un
  campo no relevante (por ejemplo, un timestamp de lectura) se trataria como
  conflicto si existiera; con los campos actuales de `Inspection` esto no es
  un problema observado, pero es una limitacion a vigilar si se agregan
  campos derivados.
- La proteccion contra respuestas fuera de orden depende de que todas las
  partes que escriben en el mismo `QueueStorage` respeten el contrato
  `attemptId`/`status`. Un escritor que ignore ese contrato podria introducir
  inconsistencias; esto no esta cubierto por las pruebas automatizadas porque
  excede el alcance de `SyncQueue`.
- Las pruebas usan un almacenamiento en memoria (`sync-test-helpers.mjs`), no
  IndexedDB real. La capa de IndexedDB (`indexed-db.ts`) implementa el mismo
  contrato `QueueStorage`, pero su comportamiento con transacciones reales del
  navegador no se prueba automaticamente en este hito.

## 12. Flujo del caso de conflicto reproducido

1. Estado local: la inspeccion tiene `summary = "Observacion registrada sin conexion"` y el cliente conoce la version 1 del servidor.
2. Estado remoto: el servidor esta en la version 2 con `summary = "Observacion registrada por otro usuario"`.
3. Deteccion: `detectConflict()` devuelve `true` porque la version avanzo (2 > 1) y el contenido es distinto.
4. Politica aplicada: `resolveConflict()` con `manual`.
5. Resultado determinista: se conserva el contenido local, el registro de conflicto queda con `serverVersion = 2` y `resolutionPolicy = "manual"`, y nada se pierde.

Evidencia: `npm test` ejecuta `tests/sync.spec.ts` (9 pruebas, todas en verde).