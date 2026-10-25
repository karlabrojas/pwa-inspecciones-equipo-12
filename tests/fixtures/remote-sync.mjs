export function createRemoteSyncFixture({ loseFirstResponse = false } = {}) {
  const inspectionsByKey = new Map();
  const requests = [];
  let shouldLoseFirstResponse = loseFirstResponse;

  return {
    requests,
    get inspectionCount() {
      return inspectionsByKey.size;
    },
    async create(idempotencyKey, inspection) {
      requests.push(idempotencyKey);

      const isNew = !inspectionsByKey.has(idempotencyKey);
      if (isNew) {
        inspectionsByKey.set(idempotencyKey, structuredClone(inspection));
      }

      if (isNew && shouldLoseFirstResponse) {
        shouldLoseFirstResponse = false;
        throw new Error("Respuesta remota perdida (simulada).");
      }

      return {
        status: isNew ? "created" : "duplicate",
        inspection: structuredClone(inspectionsByKey.get(idempotencyKey)),
      };
    },
  };
}
