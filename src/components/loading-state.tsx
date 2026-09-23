export default function LoadingState() {
  return (
    <section
      className="state-message"
      role="status"
      aria-live="polite"
      aria-label="Cargando inspección"
    >
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-title">Cargando inspección...</p>
      <p className="muted">
        Estamos preparando los datos sintéticos de la inspección.
      </p>
    </section>
  );
}
