/**
 * useConfirmDialog — SRP
 *
 * Centraliza los Swal.fire de confirmación que se repiten en todas las páginas
 * (careers/List, semesters/List, subjects/List, rubrics/List, study-plan/List).
 *
 * Antes: cada página copiaba el mismo bloque Swal.fire con sus opciones.
 * Ahora: un hook con variantes predefinidas (danger, warning, question, info).
 */

import Swal from "sweetalert2";

type DialogVariant = "danger" | "warning" | "question" | "info";

interface ConfirmOptions {
  title: string;
  text?: string;
  html?: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ICON_MAP: Record<DialogVariant, "warning" | "question" | "info" | "error"> = {
  danger:   "warning",
  warning:  "warning",
  question: "question",
  info:     "info",
};

const CONFIRM_COLOR: Record<DialogVariant, string> = {
  danger:   "#d33",
  warning:  "#f59e0b",
  question: "#3b82f6",
  info:     "#3b82f6",
};

export function useConfirmDialog() {
  /**
   * Muestra un diálogo de confirmación y devuelve true si el usuario confirma.
   */
  const confirm = async (options: ConfirmOptions): Promise<boolean> => {
    const {
      title,
      text,
      html,
      variant = "question",
      confirmLabel = "Confirmar",
      cancelLabel = "Cancelar",
    } = options;

    const result = await Swal.fire({
      title,
      text,
      html,
      icon: ICON_MAP[variant],
      showCancelButton: true,
      confirmButtonText: confirmLabel,
      cancelButtonText: cancelLabel,
      confirmButtonColor: CONFIRM_COLOR[variant],
    });

    return result.isConfirmed;
  };

  /**
   * Muestra un diálogo informativo (sin cancelar).
   */
  const alert = (
    title: string,
    text: string,
    icon: "success" | "error" | "info" | "warning" = "info"
  ) =>
    Swal.fire({ title, text, icon });

  return { confirm, alert };
}