import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { register } from "node:module";

import { validateInspectionTitle } from "../src/lib/data/inspection-validation.ts";
// @ts-ignore -- next.config.mjs no tiene tipos
import nextConfig from "../next.config.mjs";

const ROOT = resolve(import.meta.dirname, "..");

// route.ts importa "next/server", que Node ESM no resuelve sin extension.
// Se sustituye NextResponse por un stub minimo (Response.json) para probar
// solo la logica de validacion del endpoint. El runtime real de Next se cubre en E2E.
const hookSource = [
  "const stub = 'export const NextResponse = { json: (body, init) => Response.json(body, init) };';",
  "export async function resolve(specifier, context, nextResolve) {",
  "  if (specifier === 'next/server') {",
  "    return { url: 'data:text/javascript,' + encodeURIComponent(stub), shortCircuit: true };",
  "  }",
  "  return nextResolve(specifier, context);",
  "}",
].join("\n");
register("data:text/javascript," + encodeURIComponent(hookSource), import.meta.url);

const route = await import("../src/app/api/inspections/route.ts");

// ---------------------------------------------------------------------------
// Auditores reutilizables (se aplican al codigo real y a versiones debilitadas)
// ---------------------------------------------------------------------------

function parseCsp(csp: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();
  for (const part of csp.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    directives.set(tokens[0], tokens.slice(1));
  }
  return directives;
}

function auditCsp(csp: string): string[] {
  const problems: string[] = [];
  const d = parseCsp(csp);
  if (!d.get("default-src")?.includes("'self'")) problems.push("default-src debe incluir 'self'");
  if (!d.get("object-src")?.includes("'none'")) problems.push("object-src debe ser 'none'");
  if (!d.get("frame-ancestors")?.includes("'none'")) problems.push("frame-ancestors debe ser 'none'");
  if (!d.get("base-uri")?.includes("'self'")) problems.push("base-uri debe incluir 'self'");
  for (const [name, values] of d) {
    if (values.includes("*")) problems.push(`${name} usa comodin *`);
    if (values.includes("'unsafe-eval'")) problems.push(`${name} permite 'unsafe-eval'`);
    if (values.some((v) => v === "http:" || v.startsWith("http://"))) {
      problems.push(`${name} permite origenes http sin cifrar`);
    }
  }
  return problems;
}

function rejectsInvalidTitles(validate: (title: string) => string | null): boolean {
  return ["", "   ", "x".repeat(121)].every((title) => validate(title) !== null);
}

const SECRET_PATTERNS: RegExp[] = [
  /(api[_-]?key|secret|passwd|password|private[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/i,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{36}/,
  /NEXT_PUBLIC_[A-Z_]*(SECRET|PASSWORD|PRIVATE|TOKEN)/,
];

function findSecrets(text: string): string[] {
  return SECRET_PATTERNS.filter((p) => p.test(text)).map((p) => p.source);
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (/\.(ts|tsx|js|mjs|json|webmanifest|css|txt)$/.test(name)) out.push(full);
  }
  return out;
}

async function getSecurityHeaders(): Promise<Record<string, string>> {
  const rules = await nextConfig.headers();
  const catchAll = rules.find((r: { source: string }) => r.source === "/:path*");
  assert.ok(catchAll, "Los encabezados deben aplicarse a todas las rutas (/:path*)");
  const map: Record<string, string> = {};
  for (const h of catchAll.headers) map[h.key.toLowerCase()] = h.value;
  return map;
}

// ---------------------------------------------------------------------------
// 1. Encabezados y CSP (next.config.mjs)
// ---------------------------------------------------------------------------

test("seguridad/encabezados: CSP real cumple la politica minima", async () => {
  const headers = await getSecurityHeaders();
  const csp = headers["content-security-policy"];
  assert.ok(csp, "Debe existir Content-Security-Policy");
  assert.deepEqual(auditCsp(csp), []);
});

test("seguridad/encabezados: encabezados complementarios presentes", async () => {
  const headers = await getSecurityHeaders();
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.match(headers["permissions-policy"], /microphone=\(\)/);
  assert.doesNotMatch(headers["permissions-policy"], /(camera|geolocation)=\*/);
});

test("seguridad/encabezados: la CSP no bloquea capacidades legitimas de la PWA", async () => {
  const d = parseCsp((await getSecurityHeaders())["content-security-policy"]);
  assert.ok(d.get("worker-src")?.includes("'self'"), "El service worker necesita worker-src 'self'");
  assert.ok(d.get("manifest-src")?.includes("'self'"), "El manifest necesita manifest-src 'self'");
  assert.ok(d.get("connect-src")?.includes("'self'"), "La sincronizacion necesita connect-src 'self'");
  assert.ok(d.get("img-src")?.includes("blob:"), "La camara genera imagenes blob:");
});

test("NEGATIVO seguridad/encabezados: una CSP debilitada es detectada", () => {
  assert.ok(auditCsp("default-src *").length > 0, "Comodin debe detectarse");
  assert.ok(
    auditCsp("default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; script-src 'self' 'unsafe-eval'")
      .some((p) => p.includes("unsafe-eval")),
  );
  assert.ok(
    auditCsp("default-src 'self'; object-src 'none'; base-uri 'self'").some((p) => p.includes("frame-ancestors")),
    "Sin frame-ancestors debe detectarse (clickjacking)",
  );
  assert.ok(
    auditCsp("default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; connect-src http://ejemplo.test")
      .some((p) => p.includes("http")),
  );
});

// ---------------------------------------------------------------------------
// 2. Validacion de titulo (inspection-validation.ts)
// ---------------------------------------------------------------------------

test("seguridad/validacion: acepta titulos validos y casos limite", () => {
  assert.equal(validateInspectionTitle("Revision sintetica"), null);
  assert.equal(validateInspectionTitle("x".repeat(120)), null);
  assert.equal(validateInspectionTitle("  " + "x".repeat(120) + "  "), null, "El limite aplica tras recortar espacios");
  assert.equal(validateInspectionTitle("a"), null);
});

test("seguridad/validacion: rechaza titulos invalidos", () => {
  assert.notEqual(validateInspectionTitle(""), null);
  assert.notEqual(validateInspectionTitle("     "), null);
  assert.notEqual(validateInspectionTitle("\t\n"), null);
  assert.notEqual(validateInspectionTitle("x".repeat(121)), null);
  assert.notEqual(validateInspectionTitle("x".repeat(5000)), null);
});

test("seguridad/validacion: rechaza tipos no textuales", () => {
  for (const value of [123, null, undefined, {}, [], true]) {
    assert.notEqual(validateInspectionTitle(value as unknown as string), null, `Debe rechazar ${JSON.stringify(value)}`);
  }
});

test("NEGATIVO seguridad/validacion: un validador que acepta todo es detectado", () => {
  assert.equal(rejectsInvalidTitles(validateInspectionTitle), true);
  assert.equal(rejectsInvalidTitles(() => null), false, "Un validador roto debe fallar el contrato");
  assert.equal(
    rejectsInvalidTitles((t) => (t.trim().length === 0 ? "error" : null)),
    false,
    "Un validador sin limite de longitud debe fallar el contrato",
  );
});

// ---------------------------------------------------------------------------
// 3. Endpoint /api/inspections (route.ts)
// ---------------------------------------------------------------------------

let keyCounter = 0;
const uniqueKey = () => `sec-test-key-${++keyCounter}`;

const validInspection = (over: Record<string, unknown> = {}) => ({
  id: "insp-sintetica-1",
  title: "Revision sintetica de laboratorio",
  location: "Laboratorio sintetico A",
  ...over,
});

function postRequest(opts: {
  key?: string | null;
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers ?? {}) };
  if (opts.key !== null) headers["Idempotency-Key"] = opts.key ?? uniqueKey();
  const body = opts.rawBody ?? JSON.stringify(opts.body ?? { inspection: validInspection() });
  return new Request("http://localhost/api/inspections", { method: "POST", headers, body });
}

test("seguridad/api: acepta una inspeccion valida (201) y detecta el duplicado (200)", async () => {
  const key = uniqueKey();
  const first = await route.POST(postRequest({ key }));
  assert.equal(first.status, 201);
  assert.deepEqual(await first.json(), { duplicate: false, version: 1 });

  const second = await route.POST(postRequest({ key }));
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { duplicate: true, version: 1 });
});

test("seguridad/api: acepta valores exactamente en el limite", async () => {
  const res = await route.POST(
    postRequest({
      key: "k".repeat(150),
      body: { inspection: validInspection({ id: "i".repeat(100), title: "t".repeat(120), location: "l".repeat(200) }) },
    }),
  );
  assert.equal(res.status, 201);
});

test("seguridad/api: rechaza Idempotency-Key ausente, invalida o demasiado larga", async () => {
  const cases: Array<[string, string | null]> = [
    ["ausente", null],
    ["vacia", ""],
    ["con espacios", "clave con espacios"],
    ["con caracteres especiales", "clave;DROP TABLE"],
    ["con slash", "../etc/passwd"],
    ["151 caracteres", "k".repeat(151)],
  ];
  for (const [label, key] of cases) {
    const res = await route.POST(postRequest({ key }));
    assert.equal(res.status, 400, `Idempotency-Key ${label} debe devolver 400`);
  }
});

test("seguridad/api: rechaza cuerpos demasiado grandes (413)", async () => {
  const res = await route.POST(postRequest({ headers: { "content-length": "100001" } }));
  assert.equal(res.status, 413);
});

test("seguridad/api: rechaza JSON malformado (400)", async () => {
  const res = await route.POST(postRequest({ rawBody: "{no-es-json" }));
  assert.equal(res.status, 400);
});

test("seguridad/api: rechaza inspecciones invalidas sin almacenarlas", async () => {
  const invalidBodies: Array<[string, unknown]> = [
    ["sin inspection", {}],
    ["inspection null", { inspection: null }],
    ["inspection arreglo", { inspection: [] }],
    ["inspection texto", { inspection: "texto" }],
    ["id vacio", { inspection: validInspection({ id: "" }) }],
    ["id solo espacios", { inspection: validInspection({ id: "   " }) }],
    ["id de 101 caracteres", { inspection: validInspection({ id: "i".repeat(101) }) }],
    ["id numerico", { inspection: validInspection({ id: 7 }) }],
    ["titulo vacio", { inspection: validInspection({ title: "" }) }],
    ["titulo de 121 caracteres", { inspection: validInspection({ title: "t".repeat(121) }) }],
    ["titulo numerico", { inspection: validInspection({ title: 99 }) }],
    ["location numerica", { inspection: validInspection({ location: 5 }) }],
    ["location de 201 caracteres", { inspection: validInspection({ location: "l".repeat(201) }) }],
  ];
  for (const [label, body] of invalidBodies) {
    const key = uniqueKey();
    const res = await route.POST(postRequest({ key, body }));
    assert.equal(res.status, 400, `${label} debe devolver 400`);

    const list = await (await route.GET()).json();
    assert.ok(
      !list.items.some((item: { operationId: string }) => item.operationId === key),
      `${label}: no debe quedar almacenada`,
    );
  }
});

test("seguridad/api: GET no expone campos innecesarios (minimizacion)", async () => {
  const key = uniqueKey();
  const location = "Ubicacion-sintetica-privada-123";
  const res = await route.POST(
    postRequest({ key, body: { inspection: validInspection({ id: "insp-min-1", location, extra: "no-expuesto" }) } }),
  );
  assert.equal(res.status, 201);

  const listRes = await route.GET();
  const text = JSON.stringify(await listRes.json());
  assert.ok(text.includes("insp-min-1"));
  assert.ok(!text.includes(location), "GET no debe devolver location");
  assert.ok(!text.includes("no-expuesto"), "GET no debe devolver campos extra");

  const items = JSON.parse(text).items;
  const item = items.find((i: { operationId: string }) => i.operationId === key);
  assert.deepEqual(Object.keys(item.inspection).sort(), ["id", "title"]);
});

// ---------------------------------------------------------------------------
// 4. robots.txt, secretos y reproducibilidad
// ---------------------------------------------------------------------------

test("seguridad/robots: existe y excluye rutas de API e inspecciones (no es autorizacion)", () => {
  const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
  assert.match(robots, /User-agent:\s*\*/);
  assert.match(robots, /Disallow:\s*\/api\//);
  assert.match(robots, /Disallow:\s*\/inspecciones\//);
});

test("seguridad/secretos: no hay credenciales en src, public ni next.config.mjs", () => {
  const files = [...listFiles(join(ROOT, "src")), ...listFiles(join(ROOT, "public")), join(ROOT, "next.config.mjs")];
  assert.ok(files.length > 5, "El escaneo debe cubrir archivos reales");
  const hits: string[] = [];
  for (const file of files) {
    const found = findSecrets(readFileSync(file, "utf8"));
    if (found.length > 0) hits.push(`${file}: ${found.join(", ")}`);
  }
  assert.deepEqual(hits, []);
});

test("NEGATIVO seguridad/secretos: el escaner detecta secretos de muestra", () => {
  assert.ok(findSecrets('const apiKey = "abcd1234efgh5678";').length > 0);
  assert.ok(findSecrets("const k = 'AKIA" + "ABCDEFGHIJKLMNOP';").length > 0);
  assert.ok(findSecrets("NEXT_PUBLIC_" + "API_SECRET=valor").length > 0);
  assert.equal(findSecrets('const titulo = "Revision sintetica";').length, 0);
});

test("reproducibilidad: lockfile y version de Node configurados", () => {
  assert.ok(existsSync(join(ROOT, "package-lock.json")), "Debe existir package-lock.json");
  const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));
  assert.ok(lock.lockfileVersion >= 2);

  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.ok(pkg.engines?.node, "package.json debe declarar engines.node");

  const nvmrc = readFileSync(join(ROOT, ".nvmrc"), "utf8").trim();
  assert.match(nvmrc, /^v?\d+(\.\d+){0,2}$/, `.nvmrc invalido: "${nvmrc}"`);
});