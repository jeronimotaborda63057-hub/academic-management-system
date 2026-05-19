interface Props {
    canSubmit: boolean;
    submitting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function AssociateFormActions({
    canSubmit,
    submitting,
    onCancel,
    onConfirm,
}: Props) {
    return (
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                Cancelar
            </button>

            <button
                type="button"
                onClick={onConfirm}
                disabled={!canSubmit || submitting}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {submitting ? "Procesando..." : "Confirmar Asociación"}
            </button>
        </div>
    );
}