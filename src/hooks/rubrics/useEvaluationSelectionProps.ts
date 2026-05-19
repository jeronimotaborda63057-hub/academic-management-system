import type { GroupOption } from "../../models/rubric/AssociateRubricTypes";

export interface UseEvaluationSelectionProps {
    groups: GroupOption[];
    onReset: () => void;
    onGroupResolved: (subjectId: string, groupId: string) => void;
}