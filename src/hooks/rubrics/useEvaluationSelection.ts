import { useState } from "react";
import Swal from "sweetalert2";

import { evaluationRubricService } from "../../services/evaluationRubricService";
import {
    findGroupByEvaluation,
    resolveGroupId,
    resolveSubjectId,
} from "../../utils/rubric/AssociateRubricUtils";
import type { EvaluationOption } from "../../models/rubric/AssociateRubricTypes";
import type { UseEvaluationSelectionReturn } from "../../models/rubric/useEvaluationSelectionReturn";
import type { UseEvaluationSelectionProps } from "./useEvaluationSelectionProps";

export const useEvaluationSelection = ({
    groups,
    onReset,
    onGroupResolved,
}: UseEvaluationSelectionProps): UseEvaluationSelectionReturn => {
    const [selectedEvaluation, setSelectedEvaluation] =
        useState<EvaluationOption | null>(null);

    const [loadingEvaluation, setLoadingEvaluation] = useState(false);

    const handleEvaluationChange = async (value: string) => {
        if (!value) {
            setSelectedEvaluation(null);
            onReset();
            return;
        }

        setLoadingEvaluation(true);

        try {
            const response = await evaluationRubricService.getEvaluation(value);
            const evaluation: EvaluationOption = response?.data ?? response;

            if (!evaluation) throw new Error("Evaluación inválida");

            setSelectedEvaluation(evaluation);

            const targetGroupId = evaluation.group_id ?? evaluation.id_group ?? "";

            if (targetGroupId && groups.length > 0) {
                const match = findGroupByEvaluation(groups, targetGroupId);

                if (match) {
                    onGroupResolved(
                        resolveSubjectId(match),
                        resolveGroupId(match)
                    );
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar la evaluación.",
            });
        } finally {
            setLoadingEvaluation(false);
        }
    };

    return { selectedEvaluation, loadingEvaluation, handleEvaluationChange };
};