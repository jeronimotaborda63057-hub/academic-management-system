import { useNavigate } from "react-router-dom";

import EvaluationStep from "../../components/rubrics/EvaluationStep";
import SubjectStep from "../../components/rubrics/SubjectStep";
import RubricStep from "../../components/rubrics/RubricStep";
import AssociateFormActions from "../../components/rubrics/AssociateFormActions";

import { useAssociateCatalogs } from "../../hooks/rubrics/useAssociateCatalog";
import { useEvaluationSelection } from "../../hooks/rubrics/useEvaluationSelection";
import { useSubjectSelection } from "../../hooks/rubrics/useSubjectSelection";
import { useAssociateSubmit } from "../../hooks/rubrics/useAssociateSubmit";
import { resolveEvaluationId } from "../../utils/rubric/AssociateRubricUtils";

export default function AssociateRubricPage() {
    const navigate = useNavigate();

    // ── Catálogos ────────────────────────────
    const { evaluations, rubrics, subjects, groups, loading } =
        useAssociateCatalogs();

    // ── Paso 3/4: asignatura + rúbrica ───────
    const {
        selectedSubjectId,
        selectedGroupId,
        selectedRubric,
        setSelectedRubric,
        handleSubjectChange,
        setSubjectAndGroup,
        resetSelection,
    } = useSubjectSelection({ groups, onRubricClear: () => setSelectedRubric(null) });

    // ── Paso 1: evaluación ───────────────────
    const { selectedEvaluation, loadingEvaluation, handleEvaluationChange } =
        useEvaluationSelection({
            groups,
            onReset: resetSelection,
            onGroupResolved: setSubjectAndGroup,
        });

    // ── Paso 5: submit ───────────────────────
    const { submitting, handleAssociate } = useAssociateSubmit({
        selectedEvaluation,
        selectedSubjectId,
        selectedGroupId,
        selectedRubric,
    });

    // ── Loading global ───────────────────────
    if (loading || loadingEvaluation) {
        return (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
                Procesando...
            </div>
        );
    }

    const currentEvaluationId = selectedEvaluation
        ? resolveEvaluationId(selectedEvaluation)
        : "";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                {/* Header */}
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Asociar rúbrica a asignatura
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Flujo interactivo estricto para gestión de rúbricas.
                    </p>
                </div>

                {/* Paso 1 */}
                <EvaluationStep
                    evaluations={evaluations}
                    selectedId={currentEvaluationId}
                    onChange={handleEvaluationChange}
                />

                {/* Pasos 3-5 (visibles solo cuando hay evaluación seleccionada) */}
                {selectedEvaluation && (
                    <div className="space-y-6">

                        {/* Paso 3 */}
                        <SubjectStep
                            subjects={subjects}
                            selectedSubjectId={selectedSubjectId}
                            onChange={handleSubjectChange}
                        />

                        {/* Paso 4 */}
                        <RubricStep
                            rubrics={rubrics}
                            selectedRubric={selectedRubric}
                            onSelect={setSelectedRubric}
                        />

                        {/* Paso 5 */}
                        <AssociateFormActions
                            canSubmit={!!selectedRubric}
                            submitting={submitting}
                            onCancel={() => navigate(-1)}
                            onConfirm={handleAssociate}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}