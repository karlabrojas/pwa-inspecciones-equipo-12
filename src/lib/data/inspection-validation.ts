const MAX_INSPECTION_TITLE_LENGTH = 120;

export function validateInspectionTitle(title: string): string | null {
  if (typeof title !== "string") {
    return "El título de la inspección debe ser texto.";
  }

  const normalizedTitle = title.trim();

  if (normalizedTitle.length === 0) {
    return "El título de la inspección es obligatorio.";
  }

  if (normalizedTitle.length > MAX_INSPECTION_TITLE_LENGTH) {
    return `El título no puede superar ${MAX_INSPECTION_TITLE_LENGTH} caracteres.`;
  }

  return null;
}
