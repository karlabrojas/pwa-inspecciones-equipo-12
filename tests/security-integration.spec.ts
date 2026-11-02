import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";

import { validateInspectionTitle } from "../src/lib/data/inspection-validation.ts";
// @ts-ignore: next.config.mjs es JavaScript sin tipos
import nextConfig from "../next.config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Sustituye NextResponse para probar la lógica del endpoint con Node.

const hookSource = [
  "const stub = 'export const NextResponse = { json: (body, init) => Response.json(body, init) };';",
  "export async function resolve(specifier, context, nextResolve) {",
  "  if (specifier === 'next/server') {",
  "    return { url: 'data:text/javascript,' + encodeURIComponent(stub), shortCircuit: true };",
  "  }",
  "  if (specifier === '../../../lib/security/inspection-schema') {",
  "    return nextResolve(specifier + '.ts', context);",
  "  }",
  "  return nextResolve(specifier, context);",
  "}",
].join("\n");

register(
  "data:text/javascript," + encodeURIComponent(hookSource),
  import.meta.url,
);

process.env.ALLOW_INSPECTIONS_DEBUG = "1";

const route = await import("../src/app/api/inspections/route.ts");

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
  const directives = parseCsp(csp);

  if (!directives.get("default-src")?.includes("'self'")) {
    problems.push("default-src debe incluir 'self'");
  }

  if (!directives.get("object-src")?.includes("'none'")) {
    problems.push("object-src debe ser 'none'");
  }

  if (!directives.get("frame-ancestors")?.includes("'none'")) {
    problems.push("frame-ancestors debe ser 'none'");
  }

  if (!directives.get("base-uri")?.includes("'self'")) {
    problems.push("base-uri debe incluir 'self'");
  }

  for (const [name, values] of directives) {
    if (values.includes("*")) problems.push(`${name} usa comodín *`);
    if (values.includes("'unsafe-eval'")) {
      problems.push(`${name} permite 'unsafe-eval'`);
    }
    if (values.some((v) => v === "http:" || v.startsWith("http://"))) {
      problems.push(`${name} permite orígenes http sin cifrar`);
    }
  }

  return problems;
}

function rejectsInvalidTitles(
  validate: (title: string) => string | null,
): boolean {
  return ["", "   ", "x".repeat(121)].every(
    (title) => validate(title) !== null,
  );
}

const SECRET_PATTERNS: RegExp[] = [
  /(api[_-]?key|secret|passwd|password|private[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/i,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{36}/,
  /NEXT_PUBLIC_[A-Z_]*(SECRET|PASSWORD|PRIVATE|TOKEN)/,
];

function findSecrets(text: string): string[] {
  return SECRET_PATTERNS.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source,
  );
}

function listFiles(dir: string): string[] {
  const out: string[] = [];

  for (const name of readdirSync(dir)) {
    const full = join(dir, name);

    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full));
    } else if (/\.(ts|tsx|js|mjs|json|webmanifest|css|txt)$/.test(name)) {
      out.push(full);
    }
  }

  return out;
}

async function getSecurityHeaders(): Promise<Record<string, string>> {
  const rules = await nextConfig.headers();
  const catchAll = rules.find(
    (rule: { source: string }) => rule.source === "/:path*",
  );

  assert.ok(catchAll, "Los encabezados deben aplicarse a todas las rutas");

  const headers: Record<string, string> = {};

  for (const header of catchAll.headers) {
    headers[header.key.toLowerCase()] = header.value;
  }

  return headers;
}

// Encabezados y CSP
test("seguridad/encabezados: CSP real cumple la política mínima", async () => {
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

test("seguridad/encabezados: CSP permite capacidades de la PWA", async () => {
  const d = parseCsp((await getSecurityHeaders())["content-security-policy"]);

  assert.ok(d.get("worker-src")?.includes("'self'"));
  assert.ok(d.get("manifest-src")?.includes("'self'"));
  assert.ok(d.get("connect-src")?.includes("'self'"));
  assert.ok(d.get("img-src")?.includes("blob:"));
});

test("NEGATIVO seguridad/encabezados: detecta una CSP debilitada", () => {
  assert.ok(auditCsp("default-src *").length > 0);

  assert.ok(
    auditCsp(
      "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; script-src 'self' 'unsafe-eval'",
    ).some((problem) => problem.includes("unsafe-eval")),
  );

  assert.ok(
    auditCsp("default-src 'self'; object-src 'none'; base-uri 'self'").some(
      (problem) => problem.includes("frame-ancestors"),
    ),
  );

  assert.ok(
    auditCsp(
      "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; connect-src http://ejemplo.test",
    ).some((problem) => problem.includes("http")),
  );
});

// Validación de título
test("seguridad/validación: acepta títulos válidos y casos límite", () => {
  assert.equal(validateInspectionTitle("Revision sintetica"), null);
  assert.equal(validateInspectionTitle("x".repeat(120)), null);
  assert.equal(validateInspectionTitle("  " + "x".repeat(120) + "  "), null);
  assert.equal(validateInspectionTitle("a"), null);
});

test("seguridad/validación: rechaza títulos inválidos", () => {
  assert.notEqual(validateInspectionTitle(""), null);
  assert.notEqual(validateInspectionTitle("     "), null);
  assert.notEqual(validateInspectionTitle("\t\n"), null);
  assert.notEqual(validateInspectionTitle("x".repeat(121)), null);
  assert.notEqual(validateInspectionTitle("x".repeat(5000)), null);
});

test("seguridad/validación: rechaza tipos no textuales", () => {
  for (const value of [123, null, undefined, {}, [], true]) {
    assert.notEqual(
      validateInspectionTitle(value as unknown as string),
      null,
      `Debe rechazar ${JSON.stringify(value)}`,
    );
  }
});

test("NEGATIVO seguridad/validación: detecta un validador defectuoso", () => {
  assert.equal(rejectsInvalidTitles(validateInspectionTitle), true);
  assert.equal(
    rejectsInvalidTitles(() => null),
    false,
  );
  assert.equal(
    rejectsInvalidTitles((title) =>
      title.trim().length === 0 ? "error" : null,
    ),
    false,
  );
});

// Endpoint de inspecciones
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };

  if (opts.key !== null) {
    headers["Idempotency-Key"] = opts.key ?? uniqueKey();
  }

  const body =
    opts.rawBody ??
    JSON.stringify(opts.body ?? { inspection: validInspection() });

  return new Request("http://localhost/api/inspections", {
    method: "POST",
    headers,
    body,
  });
}

test("seguridad/api: acepta inspección y detecta duplicados", async () => {
  const key = uniqueKey();

  const first = await route.POST(postRequest({ key }));
  assert.equal(first.status, 201);
  assert.deepEqual(await first.json(), { duplicate: false, version: 1 });

  const second = await route.POST(postRequest({ key }));
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { duplicate: true, version: 1 });
});

test("seguridad/api: acepta valores exactamente en el límite", async () => {
  const res = await route.POST(
    postRequest({
      key: "k".repeat(150),
      body: {
        inspection: validInspection({
          id: "i".repeat(100),
          title: "t".repeat(120),
          location: "l".repeat(200),
        }),
      },
    }),
  );

  assert.equal(res.status, 201);
});

test("seguridad/api: rechaza claves de idempotencia inválidas", async () => {
  const cases: Array<[string, string | null]> = [
    ["ausente", null],
    ["vacía", ""],
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

test("seguridad/api: rechaza cuerpos demasiado grandes", async () => {
  const res = await route.POST(
    postRequest({ headers: { "content-length": "100001" } }),
  );
  assert.equal(res.status, 413);
});

test("seguridad/api: rechaza JSON malformado", async () => {
  const res = await route.POST(postRequest({ rawBody: "{no-es-json" }));
  assert.equal(res.status, 400);
});

test("seguridad/api: rechaza inspecciones inválidas sin almacenarlas", async () => {
  const invalidBodies: Array<[string, unknown]> = [
    ["sin inspection", {}],
    ["inspection null", { inspection: null }],
    ["inspection arreglo", { inspection: [] }],
    ["inspection texto", { inspection: "texto" }],
    ["id vacío", { inspection: validInspection({ id: "" }) }],
    ["id solo espacios", { inspection: validInspection({ id: "   " }) }],
    ["id largo", { inspection: validInspection({ id: "i".repeat(101) }) }],
    ["id numérico", { inspection: validInspection({ id: 7 }) }],
    ["título vacío", { inspection: validInspection({ title: "" }) }],
    [
      "título largo",
      { inspection: validInspection({ title: "t".repeat(121) }) },
    ],
    ["título numérico", { inspection: validInspection({ title: 99 }) }],
    ["ubicación numérica", { inspection: validInspection({ location: 5 }) }],
    [
      "ubicación larga",
      { inspection: validInspection({ location: "l".repeat(201) }) },
    ],
  ];

  for (const [label, body] of invalidBodies) {
    const key = uniqueKey();
    const res = await route.POST(postRequest({ key, body }));

    assert.equal(res.status, 400, `${label} debe devolver 400`);

    const listResponse = await route.GET();
    assert.equal(listResponse.status, 200);

    const list = await listResponse.json();

    assert.ok(
      !list.items.some(
        (item: { operationId: string }) => item.operationId === key,
      ),
      `${label}: no debe quedar almacenada`,
    );
  }
});

test("seguridad/api: GET no expone campos innecesarios", async () => {
  const key = uniqueKey();
  const location = "Ubicacion-sintetica-privada-123";

  const res = await route.POST(
    postRequest({
      key,
      body: {
        inspection: validInspection({
          id: "insp-min-1",
          location,
        }),
      },
    }),
  );

  assert.equal(res.status, 201);

  const listResponse = await route.GET();
  assert.equal(listResponse.status, 200);

  const text = JSON.stringify(await listResponse.json());

  assert.ok(text.includes("insp-min-1"));
  assert.ok(!text.includes(location));

  const items = JSON.parse(text).items;
  const item = items.find(
    (entry: { operationId: string }) => entry.operationId === key,
  );

  assert.ok(item);
  assert.deepEqual(Object.keys(item.inspection).sort(), ["id", "title"]);
});

test("seguridad/api: rechaza Content-Type incorrecto", async () => {
  const res = await route.POST(
    postRequest({
      headers: { "content-type": "text/plain" },
    }),
  );

  assert.equal(res.status, 415);
});

test("seguridad/api: rechaza cuerpos que superan el límite real de bytes", async () => {
  const res = await route.POST(
    postRequest({
      rawBody: " ".repeat(100_001),
    }),
  );

  assert.equal(res.status, 413);
});

test("seguridad/api: GET permanece deshabilitado sin permiso de depuración", async () => {
  const previousValue = process.env.ALLOW_INSPECTIONS_DEBUG;

  try {
    delete process.env.ALLOW_INSPECTIONS_DEBUG;

    const res = await route.GET();

    assert.equal(res.status, 404);
  } finally {
    if (previousValue === undefined) {
      delete process.env.ALLOW_INSPECTIONS_DEBUG;
    } else {
      process.env.ALLOW_INSPECTIONS_DEBUG = previousValue;
    }
  }
});

// robots.txt, secretos y reproducibilidad
test("seguridad/robots: existe y excluye rutas privadas de rastreo", () => {
  const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");

  assert.match(robots, /User-agent:\s*\*/);
  assert.match(robots, /Disallow:\s*\/api\//);
  assert.match(robots, /Disallow:\s*\/inspecciones\//);
});

test("seguridad/secretos: no hay credenciales en src, public ni next.config.mjs", () => {
  const files = [
    ...listFiles(join(ROOT, "src")),
    ...listFiles(join(ROOT, "public")),
    join(ROOT, "next.config.mjs"),
  ];

  assert.ok(files.length > 5);

  const hits: string[] = [];

  for (const file of files) {
    const found = findSecrets(readFileSync(file, "utf8"));
    if (found.length > 0) hits.push(`${file}: ${found.join(", ")}`);
  }

  assert.deepEqual(hits, []);
});

test("NEGATIVO seguridad/secretos: el escáner detecta secretos de muestra", () => {
  assert.ok(findSecrets('const apiKey = "abcd1234efgh5678";').length > 0);
  assert.ok(findSecrets("const k = 'AKIA" + "ABCDEFGHIJKLMNOP';").length > 0);
  assert.ok(findSecrets("NEXT_PUBLIC_" + "API_SECRET=valor").length > 0);
  assert.equal(findSecrets('const titulo = "Revision sintetica";').length, 0);
});

test("reproducibilidad: lockfile y versión de Node configurados", () => {
  assert.ok(existsSync(join(ROOT, "package-lock.json")));

  const lock = JSON.parse(
    readFileSync(join(ROOT, "package-lock.json"), "utf8"),
  );

  assert.ok(lock.lockfileVersion >= 2);

  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

  assert.ok(pkg.engines?.node, "package.json debe declarar engines.node");

  const nvmrc = readFileSync(join(ROOT, ".nvmrc"), "utf8").trim();

  assert.match(nvmrc, /^v?\d+(\.\d+){0,2}$/);
});
