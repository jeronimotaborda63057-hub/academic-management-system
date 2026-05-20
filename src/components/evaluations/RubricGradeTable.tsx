import type { Criteria } from "../../models/uml/Criteria";
import type { Scale } from "../../models/uml/Scale";
import type {
    GradeDraft,
    GradingStudent,
} from "../../models/interfaces/GradingStudent";

import {
    getStudentDisplayName,
    getStudentIdentification,
} from "../../hooks/evaluationDisplay";

interface RubricGradeTableProps {
    criteria: Criteria[];
    draft: GradeDraft;
    finalScore: number;
    loading: boolean;
    saving: boolean;
    scales: Scale[];
    scalesByCriterion: Record<string, Scale[]>;
    selectedStudent?: GradingStudent;
    selectedEnrollmentId: string;

    onScaleChange: (criterionId: string, scaleId: string) => void;
    onCommentChange: (criterionId: string, comment: string) => void;
    onSaveDraft: () => void;
    onSubmitGrade: () => void;

    isLocked: boolean;
}

export const RubricGradeTable = ({
    criteria,
    draft,
    finalScore,
    loading,
    saving,
    scales,
    scalesByCriterion,
    selectedStudent,
    selectedEnrollmentId,
    onScaleChange,
    onCommentChange,
    onSaveDraft,
    onSubmitGrade,
    isLocked,
}: RubricGradeTableProps) => (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-gray-900">
                    {getStudentDisplayName(selectedStudent)}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Identificacion:{" "}
                    {getStudentIdentification(selectedStudent)}
                </p>
            </div>

            <div className="shrink-0 text-left md:text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                    Nota calculada
                </p>

                <p className="text-2xl font-bold text-primary sm:text-3xl">
                    {finalScore.toFixed(2)}
                </p>
            </div>
        </div>

        {loading ? (
            <div className="p-8 text-sm text-gray-500">
                Cargando informacion...
            </div>
        ) : criteria.length === 0 ? (
            <div className="p-8 text-sm text-gray-500">
                No hay criterios configurados para la rubrica de esta
                evaluacion.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-5 py-3 text-left">
                                Criterio
                            </th>

                            <th className="px-5 py-3 text-left">
                                Peso
                            </th>

                            <th className="px-5 py-3 text-left">
                                Nivel
                            </th>

                            <th className="px-5 py-3 text-left">
                                Puntaje
                            </th>

                            <th className="px-5 py-3 text-left">
                                Comentario
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {criteria.map((criterion) => {
                            const selectedScale = scales.find(
                                (scale) =>
                                    scale.id ===
                                    draft[criterion.id]?.scaleId
                            );

                            const score =
                                ((selectedScale?.value ?? 0) *
                                    (criterion.weight ?? 0)) /
                                100;

                            return (
                                <tr
                                    key={criterion.id}
                                    className="border-t border-gray-100"
                                >
                                    <td className="px-5 py-4 align-top">
                                        <p className="font-medium text-gray-900">
                                            {criterion.name}
                                        </p>

                                        {criterion.description && (
                                            <p className="mt-1 max-w-xs text-xs text-gray-500">
                                                {criterion.description}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 align-top whitespace-nowrap">
                                        {criterion.weight}%
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <select
                                            value={
                                                draft[criterion.id]
                                                    ?.scaleId ?? ""
                                            }
                                            onChange={(event) =>
                                                onScaleChange(
                                                    criterion.id,
                                                    event.target.value
                                                )
                                            }
                                            disabled={isLocked || saving}
                                            className="h-10 min-w-[220px] rounded-lg border border-gray-200 px-3 outline-none focus:border-primary"
                                        >
                                            <option value="">
                                                Selecciona nivel
                                            </option>

                                            {(
                                                scalesByCriterion[
                                                    criterion.id
                                                ] ?? []
                                            ).map((scale) => (
                                                <option
                                                    key={scale.id}
                                                    value={scale.id}
                                                >
                                                    {scale.name} (
                                                    {scale.value ?? 0})
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-5 py-4 align-top font-semibold text-gray-900 whitespace-nowrap">
                                        {score.toFixed(2)}
                                    </td>

                                    <td className="px-5 py-4 align-top">
                                        <textarea
                                            value={
                                                draft[criterion.id]
                                                    ?.comment ?? ""
                                            }
                                            onChange={(event) =>
                                                onCommentChange(
                                                    criterion.id,
                                                    event.target.value
                                                )
                                            }
                                            disabled={isLocked || saving}
                                            rows={2}
                                            className="w-full min-w-[240px] rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-primary"
                                            placeholder="Comentario por criterio"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onSaveDraft}
                disabled={
                    saving ||
                    !selectedEnrollmentId ||
                    isLocked
                }
                className="h-10 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
                Guardar borrador
            </button>

            <button
                type="button"
                onClick={onSubmitGrade}
                disabled={
                    saving ||
                    !selectedEnrollmentId ||
                    isLocked
                }
                className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
            >
                Enviar calificacion
            </button>
        </div>
    </section>
);