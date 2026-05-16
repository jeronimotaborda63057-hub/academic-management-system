import type { RubricConsultationRecord } from "../../hooks/useRubricConsultation";

interface RubricInfoPanelProps {
    record: RubricConsultationRecord;
}

const getSubjectLabel = (record: RubricConsultationRecord) => {
    if (!record.subject) return "Sin asignatura";
    return `${record.subject.name} (${record.subject.code})`;
};

const getTotalWeight = (record: RubricConsultationRecord) => {
    return record.criteria.reduce(
        (total, criterion) => total + (criterion.weight ?? 0),
        0
    );
};

export const RubricInfoPanel = ({ record }: RubricInfoPanelProps) => {
    const items = [
        {
            label: "Titulo:",
            value: record.rubric.title ?? "Sin titulo",
        },
        {
            label: "Estado:",
            value: record.rubric.is_public ? "Publica" : "Privada",
            badge: true,
            isPublic: record.rubric.is_public,
        },
        {
            label: "Criterios:",
            value: String(record.criteria.length),
        },
        {
            label: "Suma de pesos:",
            value: `${getTotalWeight(record)}%`,
            success: true,
        },
        {
            label: "Asignatura:",
            value: getSubjectLabel(record),
        },
        {
            label: "Evaluacion:",
            value: record.evaluation.name ?? "Sin evaluacion",
        },
    ];

    return (
        <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-semibold text-gray-900">
                Informacion de la rubrica
            </h3>

            <div className="mt-5 space-y-5">
                {items.map((item) => (
                    <div key={item.label} className="grid grid-cols-[90px_1fr] gap-3">
                        <p className="text-sm font-medium text-gray-600">{item.label}</p>
                        {item.badge ? (
                            <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                    item.isPublic
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {item.value}
                            </span>
                        ) : (
                            <p
                                className={`text-sm leading-5 ${
                                    item.success ? "font-semibold text-green-700" : "text-gray-800"
                                }`}
                            >
                                {item.value}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};
