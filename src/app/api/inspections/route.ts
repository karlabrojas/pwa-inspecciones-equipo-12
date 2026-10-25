import { NextResponse } from "next/server";

/**
 * Servidor de demostración en memoria para las pruebas E2E de sincronización.
 *
 * - POST recibe una operación con el encabezado Idempotency-Key.
 *   Si la clave ya se había recibido, no crea otro registro (responde 200),
 *   pero cuenta la recepción en `receipts`.
 * - GET lista lo recibido, para que las pruebas verifiquen del lado servidor
 *   cuántas inspecciones existen y cuántas veces se envió cada operación.
 *
 * No es persistente: se reinicia junto con el servidor.
 */
export const dynamic = "force-dynamic";

type ReceivedOperation = {
  operationId: string;
  version: number;
  receipts: number;
  receivedAt: string;
  inspection: Record<string, unknown>;
};

const globalStore = globalThis as typeof globalThis & {
  __receivedInspections?: Map<string, ReceivedOperation>;
};

function getStore(): Map<string, ReceivedOperation> {
  if (!globalStore.__receivedInspections) {
    globalStore.__receivedInspections = new Map();
  }

  return globalStore.__receivedInspections;
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (!idempotencyKey) {
    return NextResponse.json(
      { error: "Falta el encabezado Idempotency-Key." },
      { status: 400 },
    );
  }

  let body: { inspection?: Record<string, unknown> };

  try {
    body = (await request.json()) as { inspection?: Record<string, unknown> };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON no válido." },
      { status: 400 },
    );
  }

  if (!body.inspection || typeof body.inspection.id !== "string") {
    return NextResponse.json(
      { error: "La inspección no es válida." },
      { status: 400 },
    );
  }

  const store = getStore();
  const existing = store.get(idempotencyKey);

  if (existing) {
    existing.receipts += 1;

    return NextResponse.json(
      { duplicate: true, version: existing.version },
      { status: 200 },
    );
  }

  const record: ReceivedOperation = {
    operationId: idempotencyKey,
    version: 1,
    receipts: 1,
    receivedAt: new Date().toISOString(),
    inspection: body.inspection,
  };

  store.set(idempotencyKey, record);

  return NextResponse.json(
    { duplicate: false, version: record.version },
    { status: 201 },
  );
}

export async function GET() {
  return NextResponse.json({ items: Array.from(getStore().values()) });
}
