// Verificación reproducible de controles de seguridad contra un servidor en ejecución.
// Uso (con el servidor ya levantado):  node scripts/check-security.mjs [URL_BASE]
// Si el servidor se inició con ALLOW_INSPECTIONS_DEBUG=1, define la misma variable
// al ejecutar este script para que espere GET /api/inspections = 200 (si no, 404).

const base = (process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const debugEnabled = process.env.ALLOW_INSPECTIONS_DEBUG === "1";
const run = Date.now();
let failures = 0;

function report(ok, name, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? ` -> ${detail}` : ""}`);
}

async function post({ key = `k-${run}-${Math.random().toString(36).slice(2, 8)}`, headers = {}, body, contentType = "application/json" } = {}) {
  const h = { ...headers };
  if (contentType) h["Content-Type"] = contentType;
  if (key !== null) h["Idempotency-Key"] = key;
  const response = await fetch(`${base}/api/inspections`, {
    method: "POST",
    headers: h,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { status: response.status, data, key };
}

const valid = { id: "INS-CHECK", title: "Prueba de seguridad", location: "Lab" };

// 1) Encabezados de seguridad
const home = await fetch(`${base}/`);
const h = (name) => home.headers.get(name) ?? "";
report(h("content-security-policy").includes("default-src 'self'"), "CSP presente con default-src 'self'");
report(h("content-security-policy").includes("object-src 'none'"), "CSP bloquea object-src");
report(h("content-security-policy").includes("frame-ancestors 'none'"), "CSP bloquea frame-ancestors");
report(h("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff");
report(h("x-frame-options") === "DENY", "X-Frame-Options: DENY");
report(h("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy");
report(h("permissions-policy").includes("camera=(self)"), "Permissions-Policy limita cámara");
if (base.startsWith("https://")) {
  report(h("strict-transport-security").length > 0, "HSTS presente (HTTPS)", h("strict-transport-security"));
} else {
  console.log("INFO HSTS no evaluado (URL no es HTTPS)");
}

// 2) robots.txt
const robots = await fetch(`${base}/robots.txt`);
const robotsText = await robots.text();
report(robots.status === 200 && robotsText.includes("Disallow: /api/"), "robots.txt existe y bloquea /api/");

// 3) API: entradas válidas e inválidas
const first = await post({ body: { inspection: valid } });
report(first.status === 201 && first.data?.duplicate === false, "Entrada válida -> 201", String(first.status));
const again = await post({ key: first.key, body: { inspection: valid } });
report(again.status === 200 && again.data?.duplicate === true, "Misma Idempotency-Key -> 200 duplicate", String(again.status));

const rejected = [
  ["Campo no permitido", { body: { inspection: { ...valid, role: "admin" } } }, 400],
  ["Sin id", { body: { inspection: { title: "T", location: "L" } } }, 400],
  ["Id con caracteres inválidos", { body: { inspection: { ...valid, id: "../etc/passwd" } } }, 400],
  ["Título vacío", { body: { inspection: { ...valid, title: "   " } } }, 400],
  ["Título demasiado largo", { body: { inspection: { ...valid, title: "t".repeat(121) } } }, 400],
  ["Tipo incorrecto en location", { body: { inspection: { ...valid, location: 5 } } }, 400],
  ["Inspección no es objeto", { body: { inspection: "texto" } }, 400],
  ["JSON inválido", { body: "{no es json" }, 400],
  ["Sin Idempotency-Key", { key: null, body: { inspection: valid } }, 400],
  ["Idempotency-Key con caracteres inválidos", { key: "a b/c", body: { inspection: valid } }, 400],
  ["Content-Type incorrecto", { contentType: "text/plain", body: JSON.stringify({ inspection: valid }) }, 415],
  ["Cuerpo mayor a 100 KB", { body: JSON.stringify({ inspection: { ...valid, title: "x".repeat(100_100) } }) }, 413],
];

for (const [name, options, expected] of rejected) {
  const result = await post(options);
  report(result.status === expected, `${name} -> ${expected}`, String(result.status));
}

// 4) GET restringido
const list = await fetch(`${base}/api/inspections`);
const expectedList = debugEnabled ? 200 : 404;
report(list.status === expectedList, `GET /api/inspections -> ${expectedList}`, String(list.status));

console.log(failures === 0 ? "\nTodas las verificaciones pasaron." : `\n${failures} verificación(es) fallaron.`);
process.exit(failures === 0 ? 0 : 1);
