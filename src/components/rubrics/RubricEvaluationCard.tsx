import { CheckCircle, ClipboardList } from "lucide-react";

import type { RubricConsultationRecord } from "../../hooks/useRubricConsultation";

interface RubricEvaluationCardProps {
    record: RubricConsultationRecord;
}

const getSubjectLabel = (record: RubricConsultationRecord) => {
    if (!record.subject) return "Sin asignatura";
    return `${record.subject.name} (${record.subject.code})`;
};

const getTeacherLabel = (record: RubricConsultationRecord) => {
    const name = [
        record.teacher?.first_name,
        record.teacher?.last_name,
    ].filter(Boolean).join(" ");

    return name || "Sin docente";
};

const getEvaluationCode = (record: RubricConsultationRecord) => {
    if (!record.evaluation.id) return "Sin codigo";
    return `EVAL-${record.evaluation.id.slice(0, 6).toUpperCase()}`;
};

export const RubricEvaluationCard = ({ record }: RubricEvaluationCardProps) => (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <ClipboardList size={22} />
                </div>

                <div>
                    <p className="text-sm text-gray-500">Evaluacion</p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-900">
                        {record.evaluation.name ?? "Evaluacion sin nombre"}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>Codigo: {getEvaluationCode(record)}</span>
                        <span className="text-gray-300">|</span>
                        <span>Tipo: Evaluacion</span>
                        <span className="text-gray-300">|</span>
                        <span>Ponderacion: {record.evaluation.weight ?? 0}%</span>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-500">Asignatura</p>
                <p className="mt-2 text-sm font-medium text-gray-800">
                    {getSubjectLabel(record)}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">Grupo</p>
                <p className="mt-2 text-sm font-medium text-gray-800">
                    {record.group?.name ?? record.group?.group_code ?? "Sin grupo"}
                </p>
            </div>

            <div>
                <p className="text-sm text-gray-500">Docente</p>
                <p className="mt-2 text-sm font-medium text-gray-800">
                    {getTeacherLabel(record)}
                </p>
            </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={18} />
            <span>Rubrica asociada</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium">
                Publicada
            </span>
        </div>
    </section>
);
