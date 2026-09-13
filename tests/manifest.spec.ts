import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root: string = resolve(import.meta.dirname, "..");

const manifestPath = resolve(root, "public/manifest.webmanifest");
assert.ok(existsSync(manifestPath), "No existe public/manifest.webmanifest");

const raw = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(raw);

// Campos criticos requeridos por el issue #6
const requiredFields = ["name", "short_name", "start_url", "scope", "display"];
for (const field of requiredFields) {
  assert.ok(
    field in manifest,
    `Falta el campo obligatorio "${field}" en el manifest`
  );
  assert.ok(
    typeof manifest[field] === "string" && manifest[field].length > 0,
    `El campo "${field}" no puede estar vacio`
  );
}

// Validaciones especificas de valores esperados
assert.equal(manifest.display, "standalone", "display debe ser standalone");
assert.match(manifest.start_url, /^\//, "start_url debe ser una ruta relativa");
assert.match(manifest.scope, /^\//, "scope debe ser una ruta relativa");

// Iconos requeridos (192x192 y 512x512)
assert.ok(Array.isArray(manifest.icons), "El manifest debe incluir un arreglo de icons");

const sizesPresent = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
assert.ok(sizesPresent.includes("192x192"), "Falta el icono de 192x192");
assert.ok(sizesPresent.includes("512x512"), "Falta el icono de 512x512");

for (const icon of manifest.icons as Array<{ src: string; type: string }>) {
  assert.ok(icon.src, "Cada icono debe tener una ruta src");
  assert.ok(icon.type === "image/png", `El icono ${icon.src} debe ser image/png`);

  const iconPath = resolve(root, "public", icon.src.replace(/^\//, ""));
  assert.ok(existsSync(iconPath), `No se encontro el archivo del icono: ${icon.src}`);
}

console.log("manifest.spec.ts: PASS");
