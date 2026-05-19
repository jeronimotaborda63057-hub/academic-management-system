import type { Criteria } from "../../models/uml/Criteria";
import type { Scale } from "../../models/uml/Scale";

interface RubricReadOnlyTableProps {
    criteria: Criteria[];
    scales: Scale[];
}

const headerColors = [
    "text-green-700",
    "text-blue-700",
    "text-amber-700",
    "text-red-700",
    "text-gray-700",
];

const getScaleHeaders = (scales: Scale[]) => {
    const headers: Scale[] = [];

    scales.forEach((scale) => {
        const exists = headers.some((item) => item.value === scale.value);
        if (!exists) headers.push(scale);
    });

    return headers.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
};

const getScaleForCriterion = (
    criterionId: string,
    value: number | undefined,
    scales: Scale[]
) => {
    return scales.find(
        (scale) =>
            scale.criterion_id === criterionId &&
            scale.value === value
    );
};

export const RubricReadOnlyTable = ({
    criteria,
    scales,
}: RubricReadOnlyTableProps) => {
    const scaleHeaders = getScaleHeaders(scales);
    const totalWeight = criteria.reduce(
        (total, criterion) => total + (criterion.weight ?? 0),
        0
    );

    if (criteria.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Esta rubrica no tiene criterios configurados.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700">
                            <th
                                rowSpan={2}
                                className="w-64 border-r border-gray-200 px-4 py-4 text-left align-top"
                            >
                                <span className="block font-semibold">Criterio</span>
                                <span className="font-normal text-gray-500">(Peso)</span>
                            </th>
                            <th
                                colSpan={scaleHeaders.length || 1}
                                className="px-4 py-3 text-center font-semibold"
                            >
                                Escalas de desempeño
                                <span className="block font-normal text-gray-500">(Valor)</span>
                            </th>
                        </tr>

                        <tr className="bg-gray-50 text-center">
                            {scaleHeaders.length === 0 ? (
                                <th className="border-t border-gray-200 px-4 py-3 text-gray-500">
                                    Sin niveles
                                </th>
                            ) : (
                                scaleHeaders.map((scale, index) => (
                                    <th
                                        key={`${scale.name}-${scale.value}`}
                                        className="min-w-[220px] border-l border-t border-gray-200 px-4 py-3"
                                    >
                                        <span className={`block font-semibold ${headerColors[index] ?? "text-gray-700"}`}>
                                            {scale.name ?? "Nivel"}
                                        </span>
                                        <span className="text-gray-700">
                                            ({scale.value ?? 0})
                                        </span>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {criteria.map((criterion, index) => (
                            <tr key={criterion.id} className="border-t border-gray-200">
                                <td className="border-r border-gray-200 px-4 py-5 align-top">
                                    <p className="font-semibold text-gray-900">
                                        {index + 1}. {criterion.name}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                        ({criterion.weight ?? 0}%)
                                    </p>
                                    {criterion.description && (
                                        <p className="mt-3 text-xs leading-5 text-gray-600">
                                            {criterion.description}
                                        </p>
                                    )}
                                </td>

                                {scaleHeaders.length === 0 ? (
                                    <td className="px-4 py-5 text-sm text-gray-500">
                                        No hay escalas para este criterio.
                                    </td>
                                ) : (
                                    scaleHeaders.map((header) => {
                                        const scale = getScaleForCriterion(
                                            criterion.id,
                                            header.value,
                                            scales
                                        );

                                        return (
                                            <td
                                                key={`${criterion.id}-${header.value}`}
                                                className="border-l border-gray-200 px-4 py-5 align-top leading-6 text-gray-700"
                                            >
                                                {scale?.description || "Sin descripcion."}
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-xs">
                    i
                </span>
                <span>La suma de los pesos de los criterios es {totalWeight}%.</span>
            </div>
        </div>
    );
};
