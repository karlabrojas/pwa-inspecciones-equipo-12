export type InspectionStatus = "ok" | "attention";

export type Inspection = {
  id: string;
  location: string;
  date: string;
  inspector: string;
  status: InspectionStatus;
  statusLabel: string;
  findings: number;
  summary: string;
  title: string;
  category: "infraestructura" | "equipo" | "mantenimiento";
  reporterIdentifier: string | null;
  reportedAt: string;
  detectedAt: string | null;
  assetId: string | null;
  attachments: string[];
  affectedScope: string;
  impact: string;
  priority: "baja" | "media" | "alta" | "urgente";
  riskLevel: "ninguno" | "bajo" | "medio" | "alto";
  responsibleArea: string | null;
  assignedTo: string | null;
  updates: { dateTime: string; author: string; comment: string }[];
  resolution: string | null;
  resolvedAt: string | null;
  reporterConfirmed: boolean;
};

export const inspections: Inspection[] = [
  {
    id: "inspection-001",
    location: "Laboratorio de Redes",
    date: "2026-08-28",
    inspector: "Técnica A",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Revisión visual de cableado, ventilación y estaciones de trabajo.",
    title: "Revisión general del laboratorio",
    category: "mantenimiento",
    reporterIdentifier: null,
    reportedAt: "2026-08-28T09:15:00-06:00",
    detectedAt: "2026-08-28T09:00:00-06:00",
    assetId: null,
    attachments: [],
    affectedScope: "Laboratorio de Redes; sin afectación a las actividades.",
    impact: "Sin interrupciones; revisión preventiva completada.",
    priority: "baja",
    riskLevel: "ninguno",
    responsibleArea: "Mantenimiento",
    assignedTo: null,
    updates: [],
    resolution: "No se requirieron acciones correctivas.",
    resolvedAt: "2026-08-28T10:00:00-06:00",
    reporterConfirmed: true
  },
  {
    id: "inspection-002",
    location: "Laboratorio de Electrónica",
    date: "2026-08-27",
    inspector: "Técnico B",
    status: "attention",
    statusLabel: "Requiere atención",
    findings: 2,
    summary: "Se registraron dos observaciones sintéticas para seguimiento de mantenimiento.",
    title: "Equipo requiere revisión técnica",
    category: "equipo",
    reporterIdentifier: null,
    reportedAt: "2026-08-27T11:40:00-06:00",
    detectedAt: "2026-08-27T11:20:00-06:00",
    assetId: null,
    attachments: [],
    affectedScope: "Dos equipos del Laboratorio de Electrónica.",
    impact: "El uso de los equipos afectados está limitado mientras se revisan.",
    priority: "media",
    riskLevel: "bajo",
    responsibleArea: "Soporte técnico",
    assignedTo: null,
    updates: [
      {
        dateTime: "2026-08-27T12:00:00-06:00",
        author: "Soporte técnico",
        comment: "Reporte recibido; pendiente de asignación para diagnóstico."
      }
    ],
    resolution: null,
    resolvedAt: null,
    reporterConfirmed: false
  },
  {
    id: "inspection-003",
    location: "Laboratorio de Software",
    date: "2026-08-26",
    inspector: "Técnica C",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Comprobación de equipo, señalización y disponibilidad del espacio.",
    title: "Verificación de condiciones del laboratorio",
    category: "infraestructura",
    reporterIdentifier: null,
    reportedAt: "2026-08-26T08:35:00-06:00",
    detectedAt: "2026-08-26T08:30:00-06:00",
    assetId: null,
    attachments: [],
    affectedScope: "Laboratorio de Software; sin afectación a las actividades.",
    impact: "Sin interrupciones; espacio disponible para su uso.",
    priority: "baja",
    riskLevel: "ninguno",
    responsibleArea: "Servicios generales",
    assignedTo: null,
    updates: [],
    resolution: "No se identificaron fallas que requirieran atención.",
    resolvedAt: "2026-08-26T09:00:00-06:00",
    reporterConfirmed: true
  },
  {
    id: "inspection-004",
    location: "Aula B-204",
    date: "2026-09-24",
    inspector: "María López",
    status: "attention",
    statusLabel: "Requiere atención",
    findings: 1,
    summary: "El proyector no enciende y la clase tuvo que continuar sin apoyo visual.",
    title: "Proyector fuera de servicio",
    category: "equipo",
    reporterIdentifier: "DOC-1042",
    reportedAt: "2026-09-24T10:25:00-06:00",
    detectedAt: "2026-09-24T10:05:00-06:00",
    assetId: "PROY-B204-01",
    attachments: ["proyector-aula-b204.jpg"],
    affectedScope: "Docentes y estudiantes del grupo que utiliza el aula B-204.",
    impact: "No se pueden proyectar materiales durante la clase.",
    priority: "media",
    riskLevel: "bajo",
    responsibleArea: "Soporte técnico",
    assignedTo: "Carlos Pérez",
    updates: [
      {
        dateTime: "2026-09-24T11:00:00-06:00",
        author: "Carlos Pérez",
        comment: "Se asignó el diagnóstico del proyector para el siguiente turno."
      }
    ],
    resolution: null,
    resolvedAt: null,
    reporterConfirmed: false
  },
  {
    id: "inspection-005",
    location: "Baño del edificio C, planta baja",
    date: "2026-09-23",
    inspector: "Jorge Ramírez",
    status: "ok",
    statusLabel: "Resuelta",
    findings: 1,
    summary: "Se reportó una fuga en el lavabo; mantenimiento reemplazó el empaque.",
    title: "Fuga de agua en lavabo",
    category: "mantenimiento",
    reporterIdentifier: "EST-20815",
    reportedAt: "2026-09-23T08:40:00-06:00",
    detectedAt: "2026-09-23T08:30:00-06:00",
    assetId: null,
    attachments: [],
    affectedScope: "Personas usuarias del baño del edificio C.",
    impact: "El lavabo estuvo fuera de servicio durante la reparación.",
    priority: "baja",
    riskLevel: "bajo",
    responsibleArea: "Mantenimiento",
    assignedTo: "Ana Torres",
    updates: [
      {
        dateTime: "2026-09-23T09:10:00-06:00",
        author: "Ana Torres",
        comment: "Empaque reemplazado y funcionamiento verificado."
      }
    ],
    resolution: "Se reemplazó el empaque y se comprobó que no hubiera más fugas.",
    resolvedAt: "2026-09-23T09:10:00-06:00",
    reporterConfirmed: true
  }
];

