import type { GroupOption } from "./AssociateRubricTypes";

export interface UseSubjectSelectionProps {
    groups: GroupOption[];
    onRubricClear: () => void;
}