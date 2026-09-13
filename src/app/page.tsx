"use client";

import { useEffect, useState } from "react";
import { inspections as syntheticInspections } from "../lib/data/inspections";

type ViewState = "loading" | "error" | "empty" | "normal";

export default function HomePage() {
  const [status, setStatus] = useState<ViewState>("loading");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("normal"), 800);
    return () => clearTimeout(timer);
  }, []);

  const data = status === "empty" ? [] : syntheticInspections;

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Proyecto base · Semana 2</p>
        <h1>Inspecciones de laboratorio</h1>
        <p className="lead">
          Registro de mantenimiento para trabajar con conectividad intermitente.
          Los datos mostrados son sintéticos.
        </p>
        <span className="status">
          Estado del starter: App Shell y estados de interfaz implementados
        </span>

               <div
          className="state-switcher"
          role="group"
          aria-label="Simular estados de la interfaz (solo para demostración)"
        >
          <button
            type="button"
            className={status === "loading" ? "active" : ""}
            onClick={() => setStatus("loading")}
          >
            Ver carga
          </button>
          <button
            type="button"
            className={status === "error" ? "active" : ""}
            onClick={() => setStatus("error")}
          >
            Ver error
          </button>
          <button
            type="button"
            className={status === "empty" ? "active" : ""}
            onClick={() => setStatus("empty")}
          >
            Ver vacío
          </button>
          <button
            type="button"
            className={status === "normal" ? "active" : ""}
            onClick={() => setStatus("normal")}
          >
            Ver normal
          </button>
        </div>
      </header>

      <section
        aria-labelledby="inspections-heading"
        className="content-section"
        aria-live="polite"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="inspections-heading">Inspecciones recientes</h2>
          </div>
          {status === "normal" && (
            <span className="count">{data.length} registros</span>
          )}
        </div>

        {status === "loading" && (
          <div className="state-message" role="status">
            <p>Cargando inspecciones…</p>
          </div>
        )}

        {status === "error" && (
          <div className="state-message state-error" role="alert">
            <p>
              No se pudieron cargar las inspecciones. Verifica tu conexión e
              intenta nuevamente.
            </p>
            <button type="button" onClick={() => setStatus("normal")}>
              Reintentar
            </button>
          </div>
        )}

        {status === "empty" && (
          <div className="state-message">
            <p>Aún no hay inspecciones registradas para este laboratorio.</p>
          </div>
        )}

        {status === "normal" && (
          <div className="inspection-grid">
            {data.map((inspection) => (
              <article className="inspection-card" key={inspection.id}>
                <div className="card-topline">
                  <span className={`badge badge-${inspection.status}`}>
                    {inspection.statusLabel}
                  </span>
                  <span className="muted">{inspection.date}</span>
                </div>
                <h3>{inspection.location}</h3>
                <p>{inspection.summary}</p>
                <dl>
                  <div>
                    <dt>Responsable</dt>
                    <dd>{inspection.inspector}</dd>
                  </div>
                  <div>
                    <dt>Hallazgos</dt>
                    <dd>{inspection.findings}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}