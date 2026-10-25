export function validateInspectionTitle(title: string): string | null {
  return title.trim().length > 0
    ? null
    : "El título de la inspección es obligatorio.";
}
