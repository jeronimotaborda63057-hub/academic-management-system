import type { EvaluationOption, Rubric } from "./AssociateRubricTypes";

export interface UseAssociateSubmitProps {
    selectedEvaluation: EvaluationOption | null;
    selectedSubjectId: string;
    selectedGroupId: string;
    selectedRubric: Rubric | null;
}
