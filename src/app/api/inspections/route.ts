import { NextResponse } from "next/server";

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

function getStore() {
  if (!globalStore.__receivedInspections) {
    globalStore.__receivedInspections = new Map();
  }

  return globalStore.__receivedInspections;
}

function isValidInspection(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const inspection = value as Record<string, unknown>;

  return (
    typeof inspection.id === "string" &&
    inspection.id.trim().length > 0 &&
    inspection.id.length <= 100 &&
    typeof inspection.title === "string" &&
    inspection.title.trim().length > 0 &&
    inspection.title.length <= 120 &&
    typeof inspection.location === "string" &&
    inspection.location.length <= 200
  );
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (
    !idempotencyKey ||
    idempotencyKey.length > 150 ||
    !/^[a-zA-Z0-9_-]+$/.test(idempotencyKey)
  ) {
    return NextResponse.json(
      { error: "El encabezado Idempotency-Key no es válido." },
      { status: 400 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 100_000) {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es demasiado grande." },
      { status: 413 },
    );
  }

  let body: { inspection?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON no válido." },
      { status: 400 },
    );
  }

  if (!isValidInspection(body.inspection)) {
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
  return NextResponse.json({ error: "Método no disponible." }, { status: 405 });
}
