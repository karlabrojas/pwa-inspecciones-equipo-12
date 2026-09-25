"use client";

type ErrorInspeccionesProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorInspecciones({
  reset,
}: ErrorInspeccionesProps) {
  return (
    <div className="page-shell">
      <div className="state-message state-error" role="alert">
        <p>No se pudieron cargar las inspecciones. Inténtalo de nuevo.</p>
        <button type="button" onClick={reset}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
