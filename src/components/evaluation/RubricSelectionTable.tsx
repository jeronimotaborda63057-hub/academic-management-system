import React from "react";
import { Eye } from "lucide-react";

import GenericTable from "../ui/GenericTable";

import type { Rubric } from "../../models/Rubric";

interface Props {
  rubrics: Rubric[];

  selectedRubric: Rubric | null;

  onSelect: (rubric: Rubric) => void;

  onPreview?: (rubric: Rubric) => void;
}

const RubricSelectionTable: React.FC<Props> = ({
  rubrics,
  selectedRubric,
  onSelect,
  onPreview,
}) => {

  /**
   * Transforma información
   * para GenericTable.
   */
  const data = rubrics.map((rubric) => ({

    // Mantiene información original
    ...rubric,

    // Campos renderizables
    rubric: rubric.title,

    /**
     * Rubric NO tiene subject.
     *
     * Se usa subject_id directamente.
     */
    subject:
      rubric.subject_id || "Sin asignatura",

    criteria:
      rubric.criteria?.length || 0,

    publication_date:
      rubric.created_at
        ? new Date(
            rubric.created_at
          ).toLocaleDateString()
        : "Sin fecha",
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

      {/* Header */}
      <div className="mb-5">

        <h2 className="text-lg font-semibold text-gray-900">
          Seleccionar rúbrica publicada
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Solo se muestran rúbricas públicas.
        </p>
      </div>

      {/* Tabla reutilizable */}
      <GenericTable
        data={data}
        columns={[
          "rubric",
          "subject",
          "criteria",
          "publication_date",
        ]}
        actions={[
          {
            name: "preview",
            label: "Vista previa",
            icon: <Eye size={16} />,
          },
        ]}
        selectedRowId={selectedRubric?.id}

        /**
         * Selección de fila.
         */
        onRowClick={(item) =>
          onSelect(item as Rubric)
        }

        /**
         * Acciones tabla.
         */
        onAction={(action, item) => {

          if (action === "preview") {
            onPreview?.(item as Rubric);
          }
        }}
      />
    </div>
  );
};

export default RubricSelectionTable;