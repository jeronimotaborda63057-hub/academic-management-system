import type { EvaluationOption } from "./AssociateRubricTypes";

export interface UseEvaluationSelectionReturn {
    selectedEvaluation: EvaluationOption | null;
    loadingEvaluation: boolean;
    handleEvaluationChange: (value: string) => Promise<void>;
}
