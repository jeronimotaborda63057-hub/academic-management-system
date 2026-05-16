interface FinalGradeActionsProps {
    canFinalize: boolean;
    saving: boolean;
    onDownloadReport: () => void;
    onFinalize: () => void;
}

export const FinalGradeActions = ({
    canFinalize,
    saving,
    onDownloadReport,
    onFinalize,
}: FinalGradeActionsProps) => (
    <div className="flex flex-wrap justify-end gap-3">
        <button
            type="button"
            onClick={onDownloadReport}
            className="h-10 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
            Descargar reporte
        </button>
        <button
            type="button"
            onClick={onFinalize}
            disabled={!canFinalize || saving}
            className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
        >
            {saving ? "Registrando..." : "Registrar oficial"}
        </button>
    </div>
);
