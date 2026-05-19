/**
 * StatusBadge — componente reutilizable (SRP + OCP)
 *
 * Antes: cada página de listado tenía su propio render inline:
 *   careers/List  → bg-green-100 / bg-gray-100
 *   semesters/List → bg-green-100 / bg-gray-100
 *   subjects/List  → bg-green-100 / bg-gray-200
 *   users/List     → bg-green-100 / bg-red-100
 *   rubrics/List   → RubricStatusBadge (separado pero igual en estructura)
 *
 * Ahora: un único componente con variantes declarativas.
 * Para añadir una nueva variante: agregar entrada en VARIANT_STYLES (OCP).
 *
 * Uso:
 *   <StatusBadge active={career.is_active} />
 *   <StatusBadge active={semester.is_active} trueLabel="Activo" falseLabel="Cerrado" />
 *   <StatusBadge active={rubric.is_public} trueLabel="Publicada" falseLabel="Borrador" />
 */

interface StatusBadgeProps {
  /** Si es true muestra el label/color "activo"; si es false el "inactivo" */
  active: boolean;
  /** Texto cuando active=true (default: "Activo") */
  trueLabel?: string;
  /** Texto cuando active=false (default: "Inactivo") */
  falseLabel?: string;
  /** Variante de color para el estado falso (default: "gray") */
  falseVariant?: "gray" | "red" | "yellow";
}

const FALSE_STYLES = {
  gray:   "bg-gray-100 text-gray-600",
  red:    "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

export function StatusBadge({
  active,
  trueLabel = "Activo",
  falseLabel = "Inactivo",
  falseVariant = "gray",
}: StatusBadgeProps) {
  const className = active
    ? "bg-green-100 text-green-700"
    : FALSE_STYLES[falseVariant];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {active ? trueLabel : falseLabel}
    </span>
  );
}