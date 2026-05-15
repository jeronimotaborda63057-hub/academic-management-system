import type { FinalGradeRow } from "./types";
import {
    formatScore,
    getFinalGradeStudentIdentification,
    getFinalGradeStudentName,
} from "./gradeDisplay";

interface FinalGradesTableProps {
    rows: FinalGradeRow[];
    onReview: () => void;
}

export const FinalGradesTable = ({ rows, onReview }: FinalGradesTableProps) => (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Consolidado final</h2>
            <p className="text-sm text-gray-500">
                Revisa la suma ponderada de las evaluaciones del grupo.
            </p>
        </div>

        {rows.length === 0 ? (
            <div className="p-8 text-sm text-gray-500">
                No hay estudiantes activos para consolidar.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-5 py-3 text-left">Estudiante</th>
                            <th className="px-5 py-3 text-left">Identificacion</th>
                            <th className="px-5 py-3 text-left">Evaluaciones</th>
                            <th className="px-5 py-3 text-left">Nota final</th>
                            <th className="px-5 py-3 text-left">Estado</th>
                            <th className="px-5 py-3 text-left">Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.studentId} className="border-t border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {getFinalGradeStudentName(row)}
                                </td>
                                <td className="px-5 py-4">
                                    {getFinalGradeStudentIdentification(row)}
                                </td>
                                <td className="px-5 py-4">
                                    {row.completedEvaluations}
                                    {row.incompleteEvaluations.length > 0 && (
                                        <span className="ml-2 text-xs text-amber-600">
                                            faltan {row.incompleteEvaluations.length}
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-lg font-bold text-primary">
                                    {formatScore(row.finalScore)}
                                </td>
                                <td className="px-5 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            row.isLocked
                                                ? "bg-green-100 text-green-700"
                                                : row.isComplete
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-amber-100 text-amber-700"
                                        }`}
                                    >
                                        {row.isLocked
                                            ? "Oficial"
                                            : row.isComplete
                                                ? "Listo"
                                                : "Parcial"}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    {!row.isComplete && (
                                        <button
                                            type="button"
                                            onClick={onReview}
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            Corregir evaluaciones
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </section>
);
