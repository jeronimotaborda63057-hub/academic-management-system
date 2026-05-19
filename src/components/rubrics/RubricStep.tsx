import RubricAssociationTable from "../evaluations/RubricAssociationTable";
import type { Rubric } from "../../models/rubric/AssociateRubricTypes";

// ─────────────────────────────────────────────
// ISP — Props mínimas: solo lo que este paso necesita
// SRP — Solo renderiza el selector de rúbrica
// OCP — Delega el render de la tabla a RubricAssociationTable sin modificarla
// LSP — Respeta el contrato de props de RubricAssociationTable intacto
// ─────────────────────────────────────────────

interface Props {
    rubrics: Rubric[];
    selectedRubric: Rubric | null;
    onSelect: (rubric: Rubric) => void;
}

export default function RubricStep({ rubrics, selectedRubric, onSelect }: Props) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                Paso 4: Seleccione una rúbrica pública
            </label>

            {rubrics.length === 0 && (
                <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    No existen rúbricas públicas disponibles.
                    Debe crear o publicar una rúbrica desde CU-07.
                </div>
            )}

            <RubricAssociationTable
                rubrics={rubrics}
                selectedRubric={selectedRubric}
                onSelect={onSelect}
            />
        </div>
    );
}