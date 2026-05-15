interface FinalGradeSummaryProps {
    completeCount: number;
    evaluationCount: number;
    incompleteCount: number;
    lockedCount: number;
    studentCount: number;
}

export const FinalGradeSummary = ({
    completeCount,
    evaluationCount,
    incompleteCount,
    lockedCount,
    studentCount,
}: FinalGradeSummaryProps) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase text-gray-400">Estudiantes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{studentCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase text-gray-400">Evaluaciones</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{evaluationCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase text-gray-400">Completos</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{completeCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase text-gray-400">Pendientes / oficiales</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
                {incompleteCount} / {lockedCount}
            </p>
        </div>
    </div>
);
