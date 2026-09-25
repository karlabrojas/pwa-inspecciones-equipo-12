"use client";

import { useEffect, useState } from "react";
import { inspections, type Inspection } from "@/lib/data/inspections";
import LoadingState from "@/components/loading-state";

type InspectionDetailPageProps = {
  params: {
    id: string;
  };
};

export default function InspectionDetailPage({
  params,
}: InspectionDetailPageProps) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const foundInspection = inspections.find((item) => item.id === params.id);

      setInspection(foundInspection ?? null);
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [params.id]);

  const handleSimulateError = () => {
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);

    window.setTimeout(() => {
      const foundInspection = inspections.find((item) => item.id === params.id);

      setInspection(foundInspection ?? null);
      setIsLoading(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">Inspecciones</p>
          <h1>Detalle de inspección</h1>
          <p className="lead">
            Consulta la información sintética registrada para el laboratorio.
          </p>
        </section>

        <section className="content-section">
          <LoadingState />
        </section>
      </main>
    );
  }

  if (hasError) {
    return (
      <div className="page-shell">
        <section className="hero">
          <p className="eyebrow">Inspecciones</p>
          <h1>Detalle de inspección</h1>
          <p className="lead">
            Consulta la información sintética registrada para el laboratorio.
          </p>
        </section>

        <section className="content-section">
          <div className="state-message state-error" role="alert">
            <h2>No fue posible cargar la inspección</h2>

            <p>Ocurrió un error durante la carga de los datos sintéticos.</p>

            <button type="button" onClick={handleRetry}>
              Intentar nuevamente
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="page-shell">
        <section className="hero">
          <p className="eyebrow">Inspecciones</p>
          <h1>Detalle de inspección</h1>
          <p className="lead">
            Consulta la información sintética registrada para el laboratorio.
          </p>
        </section>

        <section className="content-section">
          <div className="state-message state-error" role="alert">
            <h2>Inspección no encontrada</h2>

            <p>
              No existe una inspección sintética con el identificador{" "}
              <strong>{params.id}</strong>.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Detalle de inspección</p>

        <h1>{inspection.location}</h1>

        <p className="lead">
          Consulta la información sintética registrada para este laboratorio.
        </p>

        <span className="status">{inspection.statusLabel}</span>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Información</p>
            <h2>Datos de la inspección</h2>
          </div>

          <span className="count">
            {inspection.findings}{" "}
            {inspection.findings === 1 ? "hallazgo" : "hallazgos"}
          </span>
        </div>

        <article className="inspection-card inspection-detail-card">
          <div className="card-topline">
            <div>
              <p className="muted">Identificador</p>
              <h3>{inspection.id}</h3>
            </div>

            <span
              className={`badge ${
                inspection.status === "ok" ? "badge-ok" : "badge-attention"
              }`}
            >
              {inspection.statusLabel}
            </span>
          </div>

          <dl>
            <div>
              <dt>Laboratorio</dt>
              <dd>{inspection.location}</dd>
            </div>

            <div>
              <dt>Fecha</dt>
              <dd>{inspection.date}</dd>
            </div>

            <div>
              <dt>Inspector</dt>
              <dd>{inspection.inspector}</dd>
            </div>

            <div>
              <dt>Hallazgos</dt>
              <dd>{inspection.findings}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Comportamiento CSR</p>
            <h2>Resumen de inspección</h2>
          </div>
        </div>

        <article className="inspection-card">
          <p>
            El siguiente control modifica el estado de la interfaz sin recargar
            la página.
          </p>

          <button
            type="button"
            className="detail-button"
            onClick={() => setShowSummary((current) => !current)}
            aria-expanded={showSummary}
          >
            {showSummary ? "Ocultar resumen" : "Mostrar resumen"}
          </button>

          {showSummary && (
            <div className="detail-summary">
              <h3>Resumen</h3>
              <p>{inspection.summary}</p>
            </div>
          )}
        </article>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Prueba de estados</p>
            <h2>Verificación de error</h2>
          </div>
        </div>

        <article className="inspection-card">
          <p>
            Este control permite verificar visualmente el estado de error
            durante las pruebas de la interfaz.
          </p>

          <button
            type="button"
            className="detail-button secondary"
            onClick={handleSimulateError}
          >
            Simular error
          </button>
        </article>
      </section>
    </div>
  );
}
