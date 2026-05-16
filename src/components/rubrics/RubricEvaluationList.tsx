import { Eye } from "lucide-react";

import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";
import GenericTable from "../ui/GenericTable";
import type { RubricConsultationRecord } from "../../hooks/useRubricConsultation";

interface RubricEvaluationListProps {
    loading: boolean;
    records: RubricConsultationRecord[];
    onSelect: (record: RubricConsultationRecord) => void;
}

interface RubricEvaluationRow {
    id?: string;
    evaluation: string;
    subject: string;
    group: string;
    weight: string;
    status: string;
    original: RubricConsultationRecord;
}

const columns: Column<RubricEvaluationRow>[] = [
    { key: "evaluation", label: "Evaluacion" },
    { key: "subject", label: "Asignatura" },
    { key: "group", label: "Grupo" },
    { key: "weight", label: "Ponderacion" },
    {
        key: "status",
        label: "Estado",
        render: (value) => (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {value}
            </span>
        ),
    },
];

const actions: Action[] = [
    {
        name: "view",
        label: "Ver rubrica",
        icon: <Eye size={16} />,
        primary: true,
    },
];

const getSubjectLabel = (record: RubricConsultationRecord) => {
    if (!record.subject) return "Sin asignatura";
    return `${record.subject.name} (${record.subject.code})`;
};

const toRows = (records: RubricConsultationRecord[]): RubricEvaluationRow[] => {
    return records.map((record) => ({
        id: record.evaluation.id,
        evaluation: record.evaluation.name ?? "Evaluacion sin nombre",
        subject: getSubjectLabel(record),
        group: record.group?.name ?? record.group?.group_code ?? "Sin grupo",
        weight: `${record.evaluation.weight ?? 0}%`,
        status: "Publicada",
        original: record,
    }));
};

export const RubricEvaluationList = ({
    loading,
    records,
    onSelect,
}: RubricEvaluationListProps) => {
    if (loading) {
        return (
            <section className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                Cargando evaluaciones...
            </section>
        );
    }

    if (records.length === 0) {
        return (
            <section className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
                No tienes evaluaciones activas con rubrica publicada.
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Mis evaluaciones
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Selecciona una evaluacion para consultar su rubrica.
                </p>
            </div>

            <GenericTable<RubricEvaluationRow>
                data={toRows(records)}
                columns={columns}
                actions={actions}
                getRowId={(row) => row.id}
                onRowClick={(row) => onSelect(row.original)}
                onAction={(action, row) => {
                    if (action === "view") onSelect(row.original);
                }}
            />
        </section>
    );
};
