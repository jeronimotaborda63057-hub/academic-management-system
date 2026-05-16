import React from "react";
import { Eye } from "lucide-react";

import GenericTable from "../ui/GenericTable";

import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";
import type { Rubric } from "../../models/Rubric";

interface Props {
  rubrics: Rubric[];
  selectedRubric: Rubric | null;
  onSelect: (rubric: Rubric) => void;
  onPreview?: (rubric: Rubric) => void;
}

interface RubricSelectionRow {
  id?: string;
  rubric: string;
  subject: string;
  criteriaCount: number;
  publicationDate: string;
  originalRubric: Rubric;
}

const columns: Column<RubricSelectionRow>[] = [
  { key: "rubric", label: "Rubrica" },
  { key: "subject", label: "Asignatura" },
  { key: "criteriaCount", label: "Criterios" },
  { key: "publicationDate", label: "Fecha publicacion" },
];

const actions: Action[] = [
  {
    name: "preview",
    label: "Vista previa",
    icon: <Eye size={16} />,
  },
];

const RubricSelectionTable: React.FC<Props> = ({
  rubrics,
  selectedRubric,
  onSelect,
  onPreview,
}) => {
  const data: RubricSelectionRow[] = rubrics.map((rubric) => ({
    id: rubric.id,
    rubric: rubric.title ?? "Rubrica sin titulo",
    subject: rubric.subject_id || "Sin asignatura",
    criteriaCount: rubric.criteria?.length ?? 0,
    publicationDate: rubric.created_at
      ? new Date(rubric.created_at).toLocaleDateString()
      : "Sin fecha",
    originalRubric: rubric,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Seleccionar rubrica publicada
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Solo se muestran rubricas publicas.
        </p>
      </div>

      <GenericTable<RubricSelectionRow>
        data={data}
        columns={columns}
        actions={actions}
        selectedRowId={selectedRubric?.id}
        getRowId={(item) => item.id}
        onRowClick={(item) => onSelect(item.originalRubric)}
        onAction={(action, item) => {
          if (action === "preview") {
            onPreview?.(item.originalRubric);
          }
        }}
      />
    </div>
  );
};

export default RubricSelectionTable;
