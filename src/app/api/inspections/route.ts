import { NextResponse } from "next/server";
import {
  parseInspectionInput,
  type InspectionInput,
} from "../../../lib/security/inspection-schema";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 100_000;
const MAX_STORED_OPERATIONS = 1000;
const NO_STORE = { "Cache-Control": "no-store" };

type ReceivedOperation = {
  operationId: string;
  version: number;
  receipts: number;
  receivedAt: string;
  inspection: InspectionInput;
};

// Limitación: este almacén vive en memoria de UNA instancia. En un despliegue
// serverless (Vercel) no es compartido ni durable; una base de datos real
// sería infraestructura adicional.
const globalStore = globalThis as typeof globalThis & {
  __receivedInspections?: Map<string, ReceivedOperation>;
};

function getStore() {
  if (!globalStore.__receivedInspections) {
    globalStore.__receivedInspections = new Map();
  }

  return globalStore.__receivedInspections;
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (
    !idempotencyKey ||
    idempotencyKey.length > 150 ||
    !/^[a-zA-Z0-9_-]+$/.test(idempotencyKey)
  ) {
    return json({ error: "El encabezado Idempotency-Key no es válido." }, 400);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return json({ error: "Content-Type debe ser application/json." }, 415);
  }
  // Rechazo temprano si el cliente declara un tamaño excesivo...
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(
      { error: "El cuerpo de la solicitud es demasiado grande." },
      413,
    );
  }

  // ...pero el límite real se aplica sobre los bytes recibidos, porque
  // content-length puede faltar (chunked) o no ser fiable.
  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return json(
      { error: "El cuerpo de la solicitud es demasiado grande." },
      413,
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Cuerpo JSON no válido." }, 400);
  }

  const candidate =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).inspection
      : undefined;

  const parsed = parseInspectionInput(candidate);

  if (!parsed.ok) {
    return json(
      { error: "La inspección no es válida.", details: parsed.errors },
      400,
    );
  }

  const store = getStore();
  const existing = store.get(idempotencyKey);

  if (existing) {
    existing.receipts += 1;

    return json({ duplicate: true, version: existing.version }, 200);
  }

  if (store.size >= MAX_STORED_OPERATIONS) {
    return json({ error: "Capacidad de recepción agotada." }, 503);
  }

  const record: ReceivedOperation = {
    operationId: idempotencyKey,
    version: 1,
    receipts: 1,
    receivedAt: new Date().toISOString(),
    inspection: parsed.value, // solo el objeto validado y normalizado
  };

  store.set(idempotencyKey, record);

  return json({ duplicate: false, version: record.version }, 201);
}

export async function GET() {
  // Mínimo privilegio: el listado es solo para pruebas/depuración.
  if (process.env.ALLOW_INSPECTIONS_DEBUG !== "1") {
    return json({ error: "No encontrado." }, 404);
  }

  const items = Array.from(getStore().values()).map((record) => ({
    operationId: record.operationId,
    version: record.version,
    receipts: record.receipts,
    receivedAt: record.receivedAt,
    inspection: {
      id: record.inspection.id,
      title: record.inspection.title,
    },
  }));

  return json({ items }, 200);
}
