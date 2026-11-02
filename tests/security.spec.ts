import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INSPECTION_LIMITS,
  parseInspectionInput,
  validateInspectionTitle,
} from "../src/lib/security/inspection-schema.ts";
// @ts-ignore: next.config.mjs es JavaScript sin tipos
import nextConfig from "../next.config.mjs";

const valid = {
  id: "INS-001",
  title: "Revisión de campana",
  location: "Lab 2",
};

describe("parseInspectionInput: entradas válidas", () => {
  const cases: Array<[string, unknown, unknown]> = [
    [
      "mínima con ubicación vacía",
      { id: "a", title: "T", location: "" },
      { id: "a", title: "T", location: "" },
    ],
    ["normal", valid, valid],
    [
      "normaliza espacios de título y ubicación",
      { id: "x_1-2", title: "  Título  ", location: "  Lab  " },
      { id: "x_1-2", title: "Título", location: "Lab" },
    ],
    [
      "límites exactos",
      {
        id: "a".repeat(INSPECTION_LIMITS.id),
        title: "t".repeat(INSPECTION_LIMITS.title),
        location: "l".repeat(INSPECTION_LIMITS.location),
      },
      {
        id: "a".repeat(INSPECTION_LIMITS.id),
        title: "t".repeat(INSPECTION_LIMITS.title),
        location: "l".repeat(INSPECTION_LIMITS.location),
      },
    ],
  ];

  for (const [name, input, expected] of cases) {
    it(name, () => {
      const result = parseInspectionInput(input);
      assert.equal(result.ok, true);
      if (result.ok) assert.deepEqual(result.value, expected);
    });
  }
});

describe("parseInspectionInput: entradas inválidas", () => {
  const cases: Array<[string, unknown]> = [
    ["null", null],
    ["undefined", undefined],
    ["texto", "hola"],
    ["número", 42],
    ["arreglo", [valid]],
    ["objeto vacío", {}],
    ["sin id", { title: "T", location: "L" }],
    ["id numérico", { ...valid, id: 7 }],
    ["id vacío", { ...valid, id: "" }],
    ["id con espacios", { ...valid, id: "INS 001" }],
    ["id con caracteres especiales", { ...valid, id: "../etc/passwd" }],
    [
      "id demasiado largo",
      { ...valid, id: "a".repeat(INSPECTION_LIMITS.id + 1) },
    ],
    ["sin título", { id: "a", location: "L" }],
    ["título solo espacios", { ...valid, title: "   " }],
    ["título numérico", { ...valid, title: 123 }],
    [
      "título demasiado largo",
      { ...valid, title: "t".repeat(INSPECTION_LIMITS.title + 1) },
    ],
    [
      "título con caracteres de control",
      { ...valid, title: "Hola\u0000mundo" },
    ],
    ["título con salto de línea interno", { ...valid, title: "Hola\nmundo" }],
    ["ubicación no texto", { ...valid, location: { x: 1 } }],
    [
      "ubicación demasiado larga",
      { ...valid, location: "l".repeat(INSPECTION_LIMITS.location + 1) },
    ],
    ["campo no permitido", { ...valid, role: "admin" }],
    ["constructor como campo", { ...valid, constructor: { prototype: {} } }],
    [
      "__proto__ vía JSON.parse",
      JSON.parse(
        '{"id":"a","title":"T","location":"L","__proto__":{"admin":true}}',
      ),
    ],
  ];

  for (const [name, input] of cases) {
    it(`rechaza ${name}`, () => {
      const result = parseInspectionInput(input);
      assert.equal(result.ok, false);
      if (!result.ok) assert.ok(result.errors.length > 0);
    });
  }

  it("el resultado válido no comparte campos extra ni prototipo contaminado", () => {
    const result = parseInspectionInput(valid);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(Object.keys(result.value).sort(), [
        "id",
        "location",
        "title",
      ]);
      assert.equal(({} as Record<string, unknown>).admin, undefined);
    }
  });
});

describe("validateInspectionTitle (compatibilidad)", () => {
  it("acepta un título válido", () => {
    assert.equal(validateInspectionTitle("Revisión"), null);
  });

  it("mantiene los mensajes originales", () => {
    assert.equal(
      validateInspectionTitle(5),
      "El título de la inspección debe ser texto.",
    );
    assert.equal(
      validateInspectionTitle("  "),
      "El título de la inspección es obligatorio.",
    );
    assert.equal(
      validateInspectionTitle("t".repeat(121)),
      "El título no puede superar 120 caracteres.",
    );
  });
});

describe("encabezados de seguridad (next.config.mjs real)", () => {
  type Header = { key: string; value: string };

  async function loadHeaders(): Promise<Record<string, string>> {
    const rules = await nextConfig.headers();
    assert.equal(rules.length, 1);
    assert.equal(rules[0].source, "/:path*");

    return Object.fromEntries(
      rules[0].headers.map((h: Header) => [h.key, h.value]),
    );
  }

  it("la CSP restringe fuentes y bloquea objetos y marcos", async () => {
    const csp = (await loadHeaders())["Content-Security-Policy"];

    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "connect-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
    ]) {
      assert.ok(csp.includes(directive), `falta ${directive}`);
    }
  });

  it("la CSP no permite eval ni orígenes externos", async () => {
    const csp = (await loadHeaders())["Content-Security-Policy"];

    assert.ok(!csp.includes("'unsafe-eval'"));
    assert.ok(!/https?:\/\//.test(csp));
    assert.ok(!/\*/.test(csp));
  });

  it("incluye los encabezados básicos de seguridad", async () => {
    const headers = await loadHeaders();

    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  });

  it("limita los permisos del navegador a lo que usa la app", async () => {
    const permissions = (await loadHeaders())["Permissions-Policy"];

    assert.ok(permissions.includes("camera=(self)"));
    assert.ok(permissions.includes("geolocation=(self)"));
    assert.ok(permissions.includes("microphone=()"));
  });
});
