import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { evaluationRubricService } from "../../services/evaluationRubricService";
import { resolveEvaluationId } from "../../utils/rubric/AssociateRubricUtils";
import type { UseAssociateSubmitProps } from "../../models/rubric/useAssociateSubmitProps";
import type { UseAssociateSubmitReturn } from "../../models/rubric/useAssociateSubmitReturn";

export const useAssociateSubmit = ({
    selectedEvaluation,
    selectedSubjectId,
    selectedGroupId,
    selectedRubric,
}: UseAssociateSubmitProps): UseAssociateSubmitReturn => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleAssociate = async () => {
        if (!selectedEvaluation) {
            Swal.fire({ icon: "warning", title: "Evaluación requerida", text: "Debe seleccionar una evaluación." });
            return;
        }
        if (!selectedSubjectId || !selectedGroupId) {
            Swal.fire({ icon: "warning", title: "Asignatura requerida", text: "Debe seleccionar una asignatura válida." });
            return;
        }
        if (!selectedRubric) {
            Swal.fire({ icon: "warning", title: "Rúbrica requerida", text: "Debe seleccionar una rúbrica." });
            return;
        }

        const evaluationId = resolveEvaluationId(selectedEvaluation);
        const rubricId = String(
            selectedRubric.id ??
            (selectedRubric as any).rubric_id ??
            (selectedRubric as any).id_rubric ?? ""
        );

        if (!evaluationId || !rubricId) {
            Swal.fire({ icon: "error", title: "Datos inválidos", text: "No se pudo construir la asociación." });
            return;
        }

        try {
            setSubmitting(true);

            await evaluationRubricService.associate(
                evaluationId,
                selectedSubjectId,
                selectedGroupId,
                rubricId,
                selectedEvaluation.name ?? "Evaluación",
                selectedEvaluation.description ?? "",
                Number(selectedEvaluation.weight ?? 0)
            );

            await Swal.fire({
                icon: "success",
                title: "Asociación Exitosa",
                text: "La evaluación fue actualizada correctamente.",
            });

            navigate("/rubrics/associate");
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Operación bloqueada",
                text: error?.response?.data?.message ?? "No fue posible actualizar la evaluación.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return { submitting, handleAssociate };
};