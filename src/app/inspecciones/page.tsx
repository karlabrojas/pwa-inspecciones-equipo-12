import { inspections } from "../../lib/data/inspections";

// Le indica a Next.js que la ruta debe renderizarse dinámicamente en el servidor en lugar de tratarla como una página estática.
export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
	const [date, time] = value.split("T");
	const [year, month, day] = date.split("-");
	const formattedDate = `${day}-${month}-${year}`;

	return time
		? `${formattedDate} a las ${time.slice(0, 5)} hrs`
		: formattedDate;
}

export default function InspeccionesPage() {
	return (
		<div className="page-shell">
			<header className="hero">
				<p className="eyebrow">Registro de mantenimiento</p>
				<h1>Inspecciones</h1>
				<p className="lead">
					Consulta las inspecciones registradas para los laboratorios.
				</p>
			</header>

			<section
				aria-labelledby="inspections-heading"
				className="content-section"
			>
				<div className="section-heading">
					<div>
						<p className="eyebrow">Datos de inspección</p>
						<h2 id="inspections-heading">Todas las inspecciones</h2>
					</div>
					<span className="count">{inspections.length} registros</span>
				</div>

				{inspections.length === 0 ? (
					<div className="state-message">
						<p>Aún no hay inspecciones registradas.</p>
					</div>
				) : (
					<div className="inspection-grid">
						{inspections.map((inspection) => (
							<article className="inspection-card" key={inspection.id}>
								<div className="card-topline">
									<span className={`badge badge-${inspection.status}`}>
										{inspection.statusLabel}
									</span>
									<span className="muted">Folio: {inspection.id}</span>
								</div>
								<p className="eyebrow">
									{inspection.category} · Prioridad {inspection.priority}
								</p>
								<h3>{inspection.title}</h3>
								<p className="muted">{inspection.location}</p>
								<p>{inspection.summary}</p>
								{inspection.attachments.length > 0 ? (
									<ul>
									{inspection.attachments.map((attachment) => (
										<li key={attachment}>{attachment}</li>
									))}
								</ul>
								) : <p>No hay archivos adjuntos.</p>}
								<dl>
									<div>
										<dt>Responsable</dt>
										<dd>{inspection.inspector}</dd>
									</div>
									<div>
										<dt>Hallazgos</dt>
										<dd>{inspection.findings}</dd>
									</div>
									<div>
										<dt>Fecha de inspección</dt>
										<dd>
											<time dateTime={inspection.date}>
												{formatDateTime(inspection.date)}
											</time>
										</dd>
									</div>
								</dl>

								<details>
									<summary>Detalles y seguimiento</summary>
									<dl>
										<div>
											<dt>Fecha y hora del reporte</dt>
												<dd>
													<time dateTime={inspection.reportedAt}>
														{formatDateTime(inspection.reportedAt)}
													</time>
												</dd>
										</div>
										<div>
											<dt>Fecha y hora de detección</dt>
											<dd>
												{inspection.detectedAt ? (
													<time dateTime={inspection.detectedAt}>
														{formatDateTime(inspection.detectedAt)}
													</time>
												) : "Sin registrar"}
											</dd>
										</div>
										<div>
											<dt>Identificador institucional</dt>
											<dd>{inspection.reporterIdentifier ?? "Sin registrar"}</dd>
										</div>
										<div>
											<dt>Activo o equipo</dt>
											<dd>{inspection.assetId ?? "No especificado"}</dd>
										</div>
										<div>
											<dt>Alcance afectado</dt>
											<dd>{inspection.affectedScope}</dd>
										</div>
										<div>
											<dt>Impacto</dt>
											<dd>{inspection.impact}</dd>
										</div>
										<div>
											<dt>Nivel de riesgo</dt>
											<dd>{inspection.riskLevel}</dd>
										</div>
										<div>
											<dt>Área responsable</dt>
											<dd>{inspection.responsibleArea ?? "Sin asignar"}</dd>
										</div>
										<div>
											<dt>Persona asignada</dt>
											<dd>{inspection.assignedTo ?? "Sin asignar"}</dd>
										</div>
										<div>
											<dt>Resolución</dt>
											<dd>{inspection.resolution ?? "Pendiente"}</dd>
										</div>
										<div>
											<dt>Fecha de resolución</dt>
											<dd>
												{inspection.resolvedAt ? (
													<time dateTime={inspection.resolvedAt}>
														{formatDateTime(inspection.resolvedAt)}
													</time>
												) : "Pendiente"}
											</dd>
										</div>
										<div>
											<dt>Confirmado por quien reportó</dt>
											<dd>{inspection.reporterConfirmed ? "Sí" : "No"}</dd>
										</div>
									</dl>

									<h4>Actualizaciones</h4>
									{inspection.updates.length > 0 ? (
										<ul>
											{inspection.updates.map((update) => (
												<li key={`${update.dateTime}-${update.author}`}>
													<time dateTime={update.dateTime}>
														{formatDateTime(update.dateTime)}
													</time>
													{" · "}{update.author}: {update.comment}
												</li>
											))}
										</ul>
									) : <p>Sin actualizaciones.</p>}
								</details>
							</article>
						))}
					</div>
				)}
			</section>
		</div>
	);
}