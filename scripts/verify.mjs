import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "package.json",
  "package-lock.json",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/lib/data/inspections.ts",
  "src/components/app-shell.tsx",
  "public/manifest.webmanifest",
  "docs/requirements.md",
  "docs/decision-record.md",
  "tests/starter.spec.mjs",
  "tests/manifest.spec.ts",
  "evidence/individual.md",
  "src/lib/device/camera.ts",
  "src/lib/device/geolocation.ts",
  "src/lib/notifications/client.ts",
  "tests/capabilities.spec.ts",
  "tests/notifications.spec.ts",
  "docs/capabilities.md",
  "docs/test-strategy.md",
  ".github/workflows/academic-evaluation.yml",
  "playwright.config.ts",
  "tests/e2e/helpers.ts",
  "tests/unit/validation.spec.ts",
  "tests/unit/queue.spec.ts",
  "tests/integration/offline-sync.spec.ts",
  ".eslintrc.json"
];

const missing = required.filter((file) => !existsSync(resolve(root, file)));
const result = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  status: missing.length === 0 ? "pass" : "fail",
  missing
};

const report = resolve(root, "reports/verification.json");
mkdirSync(dirname(report), { recursive: true });
writeFileSync(report, `${JSON.stringify(result, null, 2)}\n`);

if (missing.length > 0) {
  console.error(`Faltan ${missing.length} artefactos: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Starter verificable: PASS");
console.log(`Reporte: ${report}`);
