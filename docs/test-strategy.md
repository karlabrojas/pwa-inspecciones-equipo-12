# Estrategia de pruebas (semana 8)

Todos los datos de prueba son sintéticos. Ninguna prueba usa servicios privados.

Flujo crítico: crear una inspección → guardarla sin conexión → recargar → reconectar → sincronizar sin duplicar. Una variante repite el flujo con una capacidad del dispositivo denegada o ausente.

## Diagnóstico inicial

Al ejecutar la PWA al empezar la semana se encontró:

- `/inspecciones` y `/inspecciones/[id]` eran de solo lectura (datos estáticos): no había formulario de captura ni uso de IndexedDB o `SyncQueue` desde la interfaz. Esto impedía probar el flujo, y se resolvió añadiendo una pantalla de captura, un sincronizador con una única instancia de `SyncQueue` y una API de demostración en memoria.
- `tests/e2e/helpers.ts` estaba desactualizado respecto de la interfaz real y se corrigió.
- `make verify` solo comprobaba que existieran archivos; ahora ejecuta lint, tipos, compilación, `npm test` y E2E.
- Tras un merge, `package.json` perdió `tsx` y el script `test:e2e`, y `tests/storage.spec.ts` dejó de ejecutarse; se restauró en `npm test`.
- No existía lint (ESLint no estaba instalado); se añadió `eslint@8` con `next/core-web-vitals`.

## Capas

| Capa                                            | Dónde                                                 | Cómo se ejecuta                                                                               |
| ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Estructura del proyecto                         | `scripts/verify.mjs`                                  | `npm run verify:artifacts`                                                                    |
| Lint                                            | `.eslintrc.json`                                      | `npm run lint`                                                                                |
| Tipos y compilación                             | `tsconfig.json`, `next build`                         | `npm run typecheck`, `npm run build`                                                          |
| Pruebas Node (proyecto, unitarias, integración) | `tests/*.spec.*`, `tests/unit/`, `tests/integration/` | `npm test`                                                                                    |
| Unitarias e integración con reporte JUnit       | `tests/unit/`, `tests/integration/`                   | `node --experimental-strip-types --test "tests/unit/*.spec.ts" "tests/integration/*.spec.ts"` |
| E2E                                             | `tests/e2e/*.e2e.ts`                                  | `npm run test:e2e`                                                                            |

## Matriz riesgo–prueba

| Riesgo                                                  | Prueba                                                                                                                                                                          | Capa                         | Justificación                                                                                                                                           | Estado |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Captura inválida se acepta                              | `tests/unit/validation.spec.ts`, `tests/integration/offline-sync.spec.ts` (rechaza un título vacío antes de guardar)                                                            | Unitaria / Integración       | La regla se prueba con entradas válidas e inválidas, y la integración comprueba que la entrada inválida no llega al almacenamiento.                     | Existe |
| Se pierde una inspección sin conexión                   | `tests/integration/offline-sync.spec.ts`, `tests/storage.spec.ts`, `tests/sync.spec.ts` (persistencia), `tests/e2e/01-offline-persistence.e2e.ts`                               | Integración / E2E            | Comprueba que lo guardado sobrevive a cerrar la cola y a recargar la página sin conexión.                                                               | Existe |
| Reconexión no sincroniza                                | `tests/e2e/02-sync-no-duplicates.e2e.ts`                                                                                                                                        | E2E                          | Recorre crear, guardar offline, recargar, reconectar y sincronizar sobre la interfaz real.                                                              | Existe |
| Duplicados al reintentar                                | `tests/unit/queue.spec.ts`, `tests/sync.spec.ts` (duplicación, idempotencia, `processLock`), `tests/integration/offline-sync.spec.ts`, `tests/e2e/02-sync-no-duplicates.e2e.ts` | Unitaria / Integración / E2E | La cola no reenvía una operación completada; la integración simula perder la primera respuesta remota; el E2E cuenta los envíos que recibe el servidor. | Existe |
| Permiso denegado o capacidad ausente bloquea la captura | `tests/capabilities.spec.ts`, `tests/notifications.spec.ts`, `tests/e2e/03-missing-capability.e2e.ts`                                                                           | Unitaria / E2E               | La captura debe completarse sin la capacidad y no se pide permiso al cargar.                                                                            | Existe |
| Una prueba no detecta un defecto real                   | Defecto controlado (ver sección propia)                                                                                                                                         | E2E + unitaria               | Demuestra que las pruebas fallan con el defecto y vuelven a pasar al restaurar.                                                                         | Existe |
| Falla offline del Service Worker                        | `tests/service-worker*.spec.ts`, `tests/offline.spec.ts`                                                                                                                        | Unitaria                     | Ejecuta el `public/sw.js` real en un sandbox con red controlable.                                                                                       | Existe |
| Regresión SSR/CSR                                       | `tests/rendering.spec.ts`                                                                                                                                                       | Unitaria                     | Comprueba estructuralmente `force-dynamic` y `"use client"`.                                                                                            | Existe |
| Código que no compila o rompe tipos                     | `npm run typecheck`, `npm run build`                                                                                                                                            | Compilación                  | Falla temprano y de forma reproducible.                                                                                                                 | Existe |

## Comandos exactos

| Etapa                             | Comando                                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Instalación limpia                | `npm ci`                                                                                                                                                                                                                                   |
| Verificación de artefactos        | `npm run verify:artifacts`                                                                                                                                                                                                                 |
| Lint                              | `npm run lint`                                                                                                                                                                                                                             |
| Tipos                             | `npm run typecheck`                                                                                                                                                                                                                        |
| Compilación                       | `npm run build`                                                                                                                                                                                                                            |
| Pruebas Node                      | `npm test`                                                                                                                                                                                                                                 |
| Unitarias e integración con JUnit | `node --experimental-strip-types --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination=reports/junit-unit-integration.xml "tests/unit/*.spec.ts" "tests/integration/*.spec.ts"` |
| E2E                               | `npx playwright install chromium` (Linux/WSL: `--with-deps chromium`) y `npm run test:e2e`                                                                                                                                                 |
| Todo junto                        | `npm run verify` (Windows) o `make verify` (Linux/WSL)                                                                                                                                                                                     |

`make verify` solo ejecuta `npm run verify`. `playwright test` arranca el servidor con `npm run build && npm run start` (ver `playwright.config.ts`).

## CI

`.github/workflows/academic-evaluation.yml` es el workflow principal. Ejecuta, en este orden: instalación limpia, verificación de artefactos, lint, tipos, compilación, `npm test`, unitarias e integración (con reporte JUnit), cobertura, instalación de Chromium y E2E. Cada paso usa `!cancelled()`, de modo que una falla no oculta los resultados siguientes, pero el job termina en rojo si alguna etapa obligatoria falla. `reports/`, `coverage/`, `playwright-report/` y `test-results/` se publican como artefacto `ci-evidence-w08-<sha>` aunque haya fallos. La cobertura es informativa y no bloquea.

`week-08-e2e.yml` («E2E Regression Evidence») ejecuta solo el E2E y se escribió para reunir la evidencia del defecto controlado; desde esta entrega se ejecuta únicamente a mano (`workflow_dispatch`) para no repetir el E2E en cada push. Sus ejecuciones anteriores se conservan como evidencia.

## Defecto controlado

| Campo                 | Detalle                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rama temporal         | `e2e/defecto-duplicados` (no se fusiona)                                                                                                                                                                                                     |
| Defecto               | Retirar el filtro de operaciones `completed` en `getPending` y `processInternal` de `SyncQueue`                                                                                                                                              |
| Commit con el defecto | [f1c1045](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/f1c1045)                                                                                                                                                          |
| Pruebas que fallaron  | Tres E2E de `02-sync-no-duplicates.e2e.ts` y dos unitarias: `idempotencia: procesar dos veces la misma operacion completada no la vuelve a enviar` y `regresion: sin el candado processLock, dos llamadas concurrentes duplicarian el envio` |
| Run fallido           | [Run #2](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/actions/runs/40165359637)                                                                                                                                                 |
| Restauración          | [f426058](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/commit/f426058): `queue.ts` idéntico a la línea base                                                                                                                     |
| Runs verdes           | [Run #3](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/actions/runs/40165644689) y [Run #5](https://github.com/karlabrojas/pwa-inspecciones-equipo-12/actions/runs/40166565775)                                                  |

Extracto de la salida del fallo (copiado del run #2):

✘ 7 [chromium] › tests/e2e/02-sync-no-duplicates.e2e.ts:20:3 › Sincronización sin duplicados › flujo completo: crear offline → recargar → reconectar → sincronizar → una sola inspección (retry #1) (934ms)
✘ 8 [chromium] › tests/e2e/02-sync-no-duplicates.e2e.ts:63:3 › Sincronización sin duplicados › disparos repetidos de sincronización no duplican la inspección (4.3s)
✘ 9 [chromium] › tests/e2e/02-sync-no-duplicates.e2e.ts:63:3 › Sincronización sin duplicados › disparos repetidos de sincronización no duplican la inspección (retry #1) (4.3s)
✘ 10 [chromium] › tests/e2e/02-sync-no-duplicates.e2e.ts:91:3 › Sincronización sin duplicados › varias inspecciones pendientes se sincronizan una vez cada una (3.7s)
✘ 11 [chromium] › tests/e2e/02-sync-no-duplicates.e2e.ts:91:3 › Sincronización sin duplicados › varias inspecciones pendientes se sincronizan una vez cada una (retry #1) (3.8s)
✘ 12 [chromium] › tests/e2e/03-missing-capability.e2e.ts:111:5 › Capacidad denegada o ausente: la captura se puede completar › geolocalización denegada por el usuario (895ms)
✘ 13 [chromium] › tests/e2e/03-missing-capability.e2e.ts:111:5 › Capacidad denegada o ausente: la captura se puede completar › geolocalización denegada por el usuario (retry #1) (888ms)
✘ 14 [chromium] › tests/e2e/03-missing-capability.e2e.ts:111:5 › Capacidad denegada o ausente: la captura se puede completar › geolocalización ausente (API inexistente) (848ms)
✘ 15 [chromium] › tests/e2e/03-missing-capability.e2e.ts:111:5 › Capacidad denegada o ausente: la captura se puede completar › geolocalización ausente (API inexistente) (retry #1) (892ms)
✘ 16 [chromium] › tests/e2e/03-missing-capability.e2e.ts:111:5 › Capacidad denegada o ausente: la captura se puede completar › cámara denegada (getUserMedia rechaza) (876ms)

## Cobertura (informativa)

Última ejecución local de la cobertura nativa de Node: 48 pruebas, 0 fallos. Líneas cubiertas por módulo de `src/`: `inspection-validation.ts` 100 %, `schema.ts` 100 %, `conflict-policy.ts` 100 %, `queue.ts` 95 %, `client.ts` de notificaciones 89 %, `indexed-db.ts` 82 %. El informe da a `camera.ts` y `geolocation.ts` 32 % y 28 % de líneas y 0 % de funciones, aunque `tests/capabilities.spec.ts` las llama y comprueba sus resultados; es probable que se deba a que ese archivo también las carga con `import()` dinámico, y queda como observación por verificar. El porcentaje global (90.88 %) incluye los propios archivos de prueba, así que sobrestima la cobertura de `src/`. No se exige un porcentaje: la cobertura sirve para detectar huecos.

## Diagnóstico ante un fallo

1. Abrir el run en GitHub Actions y localizar el primer paso en rojo.
2. Descargar el artefacto `ci-evidence-w08-<sha>`; para E2E, abrir `playwright-report/index.html` y las trazas de `test-results/`.
3. Reproducir localmente con el comando exacto de la tabla anterior.

## Limitaciones

- Solo se prueba Chromium; no hay pruebas en dispositivos reales.
- Cámara y geolocalización no tienen pantalla; sus cuatro escenarios E2E solo comprueban que la captura funciona sin la capacidad, no el comportamiento de esas capacidades. Los de notificaciones sí verifican el aviso de la interfaz. Las reglas de cámara y geolocalización se prueban en `tests/capabilities.spec.ts`.
- La cobertura de Node es experimental y no mide el E2E.
- `tests/unit/` y `tests/integration/` tienen pocas pruebas (2 de validación, 1 de cola, 1 de integración offline); cubren una regla de validación y la idempotencia, no todos los casos.
- La integración usa `fake-indexeddb` y un remoto simulado con idempotencia propia: no prueba un endpoint real.
- El servidor de demostración guarda los datos en memoria y no se limpia entre casos; el aislamiento se logra con títulos únicos por prueba.
- El E2E usa esperas fijas de 1,5 s para comprobar que no llega un reenvío tardío; no garantiza detectar uno muy tardío.
- `npm ci` reporta 6 vulnerabilidades (5 altas, 1 crítica). Tres afectan a dependencias de producción: `next` (crítica) y `postcss` (alta), que solo se corrigen pasando a Next 16 (`npm audit fix --force`), un cambio mayor con riesgo de regresión, y `source-map-js` (alta), cuya corrección sin cambio mayor (`npm audit fix`) no se aplicó en esta entrega. Las otras tres (`glob`, `@next/eslint-plugin-next` y `eslint-config-next`) vienen de las herramientas de lint, que son dependencias de desarrollo añadidas esta semana y no forman parte de la aplicación compilada. El CI no ejecuta `npm audit` como etapa obligatoria. La aplicación solo se ejecuta en entorno local y de pruebas.
- En Linux o WSL, Chromium necesita librerías del sistema (`npx playwright install --with-deps chromium`); el CI las instala. En este equipo `make verify` se ejecutó en Windows como `npm run verify`.
