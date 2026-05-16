interface GroupEnrollmentActionsProps {
    canSubmit: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}

export const GroupEnrollmentActions = ({
    canSubmit,
    isSubmitting,
    onCancel,
    onSubmit,
}: GroupEnrollmentActionsProps) => (
    <div className="flex justify-end gap-3">
        <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
            Volver
        </button>
        <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
        >
            {isSubmitting ? "Inscribiendo..." : "Confirmar inscripcion"}
        </button>
    </div>
);
