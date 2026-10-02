export function createMemoryStorage() {
  const store = new Map();
  return {
    async getAll() { return [...store.values()]; },
    async get(id) { return store.get(id) ?? null; },
    async put(op) { store.set(op.operationId, { ...op }); },
    async delete(id) { store.delete(id); },
    _raw: store,
  };
}

export const sampleInspection = (overrides = {}) => ({
  id: "inspection-sintetica-1",
  location: "Laboratorio sintetico",
  date: "2026-01-01",
  inspector: "Inspector sintetico",
  status: "ok",
  statusLabel: "Sin incidencias",
  findings: 0,
  summary: "Resumen sintetico",
  title: "Titulo sintetico",
  category: "equipo",
  reporterIdentifier: null,
  reportedAt: "2026-01-01T00:00:00-06:00",
  detectedAt: null,
  assetId: null,
  attachments: [],
  affectedScope: "ninguno",
  impact: "ninguno",
  priority: "baja",
  riskLevel: "ninguno",
  responsibleArea: null,
  assignedTo: null,
  updates: [],
  resolution: null,
  resolvedAt: null,
  reporterConfirmed: false,
  ...overrides,
});