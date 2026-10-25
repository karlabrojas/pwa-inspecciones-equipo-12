# Estrategia de pruebas (semana 8)

Todos los datos de prueba son sintéticos. Ninguna prueba usa servicios privados.

## Capas

| Capa | Dónde | Cómo se ejecuta |
|---|---|---|
| Estructura del proyecto | `scripts/verify.mjs` | `npm run verify` |
| Tipos y compilación | `tsconfig`, `next build` | `npx tsc --noEmit`, `npm run build` |
| Unitarias y de comportamiento | `tests/*.spec.ts`, `tests/*.spec.mjs` | `npm test` |
| Unitarias/integración de la semana 8 | `tests/unit/`, `tests/integration/` | `node --experimental-strip-types --test <archivos>` |
| E2E | `tests/e2e/*.e2e.ts` | `npx playwright test` |

## Matriz riesgo–prueba

| Riesgo | Prueba | Capa | Justificación | Estado |
|---|---|---|---|---|
| Captura inválida se acepta | `tests/unit/validation.spec.ts` | Unitaria | Una regla de validación se prueba con entradas válidas e inválidas. | Existe (2 pruebas) |
| Se pierde una inspección sin conexión | `tests/storage.spec.ts`, `tests/sync.spec.ts` (persistencia), `tests/e2e/01-offline-persistence.e2e.ts` | Integración / E2E | Comprueba que lo guardado sobrevive a cerrar la cola y a recargar la página. | Existe |
| Reconexión no sincroniza | `tests/e2e/02-sync-no-duplicates.e2e.ts` | E2E | Recorre crear, guardar offline, recargar, reconectar y sincronizar sobre la interfaz real. | Existe |
| Duplicados al reintentar | `tests/sync.spec.ts` (duplicación, idempotencia, `processLock`), `tests/e2e/02-sync-no-duplicates.e2e.ts` | Unitaria / E2E | La cola no reenvía una operación completada y el E2E observa los envíos recibidos por el servidor. | Existe |
| Una prueba no detecta un defecto real | Defecto controlado de Karla (retira el filtro de operaciones `completed` de `SyncQueue`) | E2E + unitaria | Demuestra que las pruebas fallan con el defecto y vuelven a pasar al restaurar. Ver `evidence/individual.md`. | Existe (evidencia de Karla) |
| Permiso denegado o capacidad ausente bloquea la captura | `tests/capabilities.spec.ts`, `tests/notifications.spec.ts`, `tests/e2e/03-missing-capability.e2e.ts` | Unitaria / E2E | La captura debe completarse sin la capacidad y no se pide permiso al cargar. | Existe |
| Falla offline del Service Worker | `tests/service-worker*.spec.ts`, `tests/offline.spec.ts` | Unitaria | Ejecuta el `public/sw.js` real en un sandbox con red controlable. | Existe |
| Regresión SSR/CSR | `tests/rendering.spec.ts` | Unitaria | Comprueba estructuralmente `force-dynamic` y `"use client"`. | Existe |
| Código que no compila o rompe tipos | `npx tsc --noEmit`, `npm run build` | Compilación | Falla temprano y de forma reproducible. | Existe |

## Comandos exactos

```bash
npm ci
npx tsc --noEmit
npm run build
npm run verify
npm test
npx playwright install chromium
npx playwright test
```

`npx playwright test` arranca el servidor con `npm run build && npm run start` (ver `playwright.config.ts`).

## CI

`.github/workflows/academic-evaluation.yml` ejecuta los pasos anteriores. Si un paso obligatorio falla, el job termina en rojo. Los pasos posteriores siguen ejecutándose para obtener todos los resultados, y `reports/`, `coverage/`, `playwright-report/` y `test-results/` se publican como artefacto aunque haya fallos. La cobertura es informativa y no bloquea.

## Diagnóstico ante un fallo

1. Abrir el run en GitHub Actions y localizar el primer paso en rojo.
2. Descargar el artefacto `ci-evidence-w08-<sha>`; para E2E, abrir `playwright-report/index.html` y las trazas de `test-results/`.
3. Reproducir localmente con el comando exacto de la tabla anterior.

## Limitaciones

- Solo se prueba Chromium; no hay pruebas en dispositivos reales.
- Cámara y geolocalización no tienen pantalla; sus escenarios E2E comprueban que la captura funciona sin la capacidad.
- No hay script de `lint` separado: el lint y los tipos que ejecuta `next build` son los que aplican.
- La cobertura de Node es experimental y mide solo las pruebas basadas en `node:test`, no el E2E.
- `tests/unit/` y `tests/integration/` tienen pocas pruebas (2 de validación, 1 de cola y 1 de integración offline); cubren una regla de validación y la idempotencia, no todos los casos.
- `tests/storage.spec.ts` ya no está en el script `npm test` tras el merge de la rama de la semana 8 (el `package.json` perdió `tsx`); el workflow lo ejecuta aparte con `node --experimental-strip-types`.
- `npm ci` reporta 3 vulnerabilidades (2 altas, 1 crítica); no se corrigieron porque `npm audit fix --force` puede romper Next.js.