"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  inspections as seedInspections,
  type Inspection,
} from "@/lib/data/inspections";
import { getStoredInspections, saveInspection } from "@/lib/storage/indexed-db";
import type { StoredInspection } from "@/lib/storage/schema";
import { syncPendingInspections } from "@/lib/sync/run-sync";

const SYNC_LABELS: Record<StoredInspection["syncStatus"], string> = {
  pending: "Pendiente de sincronizar",
  synced: "Sincronizada",
  conflict: "Conflicto por resolver",
  failed: "Error al sincronizar",
};

type CaptureValues = {
  title: string;
  location: string;
  inspector: string;
  summary: string;
};

/**
 * Construye la inspección a partir de la primera inspección sintética
 * (así hereda los campos obligatorios y valores válidos del tipo Inspection)
 * y reemplaza los datos capturados.
 */
function buildInspection(values: CaptureValues): Inspection {
  const template = seedInspections[0];

  if (!template) {
    throw new Error("No hay una inspección base para construir el registro.");
  }

  const now = new Date().toISOString();

  return {
    ...template,
    id: `LOCAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    title: values.title.trim(),
    location: values.location.trim(),
    summary: values.summary.trim() || "Sin resumen.",
    inspector: values.inspector.trim() || "Sin asignar",
    date: now,
    reportedAt: now,
    attachments: [],
    updates: [],
  };
}

export function InspectionCapture() {
  const [stored, setStored] = useState<StoredInspection[]>([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [inspector, setInspector] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setStored(await getStoredInspections());
    } catch {
      setMessage(
        "No fue posible leer las inspecciones guardadas en este dispositivo.",
      );
    }
  }, []);

  const sync = useCallback(async () => {
    try {
      await syncPendingInspections();
    } catch {
      setMessage("No fue posible sincronizar ahora. Se intentará de nuevo.");
    } finally {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    void sync();

    const handleOnline = () => {
      setIsOnline(true);
      void sync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sync]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !location.trim()) {
      setMessage("Indica el laboratorio y el título de la inspección.");
      return;
    }

    try {
      await saveInspection(
        buildInspection({ title, location, inspector, summary }),
      );

      setTitle("");
      setLocation("");
      setInspector("");
      setSummary("");
      setMessage(
        navigator.onLine
          ? "Inspección guardada. Enviando al servidor…"
          : "Inspección guardada en este dispositivo. Se enviará al recuperar la conexión.",
      );

      await refresh();

      if (navigator.onLine) {
        void sync();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la inspección.",
      );
    }
  }

  return (
    <section aria-labelledby="capture-heading" className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Captura</p>
          <h2 id="capture-heading">Registrar inspección</h2>
        </div>
        <span className="count">{isOnline ? "En línea" : "Sin conexión"}</span>
      </div>

      <form className="inspection-card" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="capture-location">Laboratorio</label>
          <input
            id="capture-location"
            name="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="capture-title">Título</label>
          <input
            id="capture-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="capture-inspector">Responsable</label>
          <input
            id="capture-inspector"
            name="inspector"
            type="text"
            value={inspector}
            onChange={(event) => setInspector(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="capture-summary">Resumen</label>
          <textarea
            id="capture-summary"
            name="summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </div>

        <button type="submit" className="detail-button">
          Guardar inspección
        </button>
        <button
          type="button"
          className="detail-button secondary"
          onClick={() => void sync()}
        >
          Sincronizar ahora
        </button>

        {message && (
          <p role="status" aria-live="polite">
            {message}
          </p>
        )}
      </form>

      <div className="section-heading">
        <div>
          <p className="eyebrow">En este dispositivo</p>
          <h3>Inspecciones capturadas</h3>
        </div>
        <span className="count">{stored.length} registros</span>
      </div>

      {stored.length === 0 ? (
        <div className="state-message">
          <p>Aún no hay inspecciones capturadas en este dispositivo.</p>
        </div>
      ) : (
        <div className="inspection-grid">
          {stored.map((item) => (
            <article
              className="inspection-card"
              data-testid="inspeccion-item"
              key={item.id}
            >
              <div className="card-topline">
                <span
                  className={`badge ${
                    item.syncStatus === "synced"
                      ? "badge-ok"
                      : "badge-attention"
                  }`}
                >
                  {SYNC_LABELS[item.syncStatus]}
                </span>
                <span className="muted">Folio: {item.id}</span>
              </div>
              <h3>{item.title}</h3>
              <p className="muted">{item.location}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
