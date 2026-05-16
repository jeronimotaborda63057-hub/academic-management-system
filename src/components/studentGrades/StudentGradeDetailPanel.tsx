import type { StudentGradeDetailRow } from "./types";
import { formatGradeScore } from "./studentGradeDisplay";

interface StudentGradeDetailPanelProps {
    details: StudentGradeDetailRow[];
    finalScore: number;
}

export const StudentGradeDetailPanel = ({
    details,
    finalScore,
}: StudentGradeDetailPanelProps) => {
    const totalObtained = details.reduce((total, detail) => total + detail.score, 0);
    const totalPossible = details.reduce(
        (total, detail) => total + detail.possibleScore,
        0
    );

    return (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Detalle de tu calificacion por criterios
                </h2>
            </div>

            {details.length === 0 ? (
                <div className="p-8 text-sm text-gray-500">
                    No hay detalle disponible para esta calificacion.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="w-12 px-4 py-3 text-left">#</th>
                                <th className="min-w-[190px] px-4 py-3 text-left">
                                    Criterio (Peso)
                                </th>
                                <th className="min-w-[160px] px-4 py-3 text-left">
                                    Nivel obtenido (Escala)
                                </th>
                                <th className="min-w-[220px] px-4 py-3 text-left">
                                    Descripcion del nivel
                                </th>
                                <th className="px-4 py-3 text-center">Puntaje obtenido</th>
                                <th className="px-4 py-3 text-center">Puntaje posible</th>
                                <th className="min-w-[220px] px-4 py-3 text-left">
                                    Comentario del docente
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((detail, index) => (
                                <tr
                                    key={`${detail.criterion?.id ?? detail.scale?.id}`}
                                    className="border-t border-gray-100"
                                >
                                    <td className="px-4 py-4 font-semibold text-gray-700">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <p className="font-semibold text-gray-900">
                                            {detail.criterion?.name ?? "Criterio sin nombre"}
                                        </p>
                                        <p className="text-xs font-medium text-gray-600">
                                            ({detail.criterion?.weight ?? 0}%)
                                        </p>
                                        {detail.criterion?.description && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                {detail.criterion.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full border border-green-500 bg-green-100" />
                                            <span className="text-gray-800">
                                                {detail.scale?.name ?? "Sin nivel"} ({detail.scale?.value ?? 0})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-gray-700">
                                        {detail.scale?.description || "Sin descripcion registrada."}
                                    </td>
                                    <td className="px-4 py-4 text-center align-top">
                                        <p className="font-bold text-green-600">
                                            {formatGradeScore(detail.score)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {detail.criterion?.weight ?? 0}% x {detail.scale?.value ?? 0}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4 text-center align-top font-semibold text-gray-700">
                                        {formatGradeScore(detail.possibleScore)}
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
                                            {detail.comment || "-"}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-gray-200 bg-gray-50">
                            <tr>
                                <td colSpan={2} className="px-4 py-4 text-center">
                                    <p className="text-xs font-semibold text-gray-500">Total obtenido</p>
                                    <p className="font-bold text-green-600">
                                        {formatGradeScore(totalObtained)}
                                    </p>
                                </td>
                                <td colSpan={2} className="px-4 py-4 text-center">
                                    <p className="text-xs font-semibold text-gray-500">Total posible</p>
                                    <p className="font-bold text-gray-700">
                                        {formatGradeScore(totalPossible)}
                                    </p>
                                </td>
                                <td colSpan={2} className="px-4 py-4 text-center">
                                    <p className="text-xs font-semibold text-gray-500">Porcentaje</p>
                                    <p className="font-bold text-gray-700">
                                        {formatGradeScore(finalScore)}%
                                    </p>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <p className="text-xs font-semibold text-primary">Nota final</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatGradeScore(finalScore)} / 100
                                    </p>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            <div className="m-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                La nota final es la suma ponderada de los puntajes obtenidos en cada criterio.
            </div>
        </section>
    );
};
