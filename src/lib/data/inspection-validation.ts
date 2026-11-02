// La validación vive ahora en src/lib/security/. Se conserva este módulo
// para no romper importaciones ni pruebas existentes.
export { validateInspectionTitle } from "../security/inspection-schema.ts";
