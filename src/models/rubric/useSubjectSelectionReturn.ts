import type { Rubric } from "../Rubric";

export interface UseSubjectSelectionReturn {
    selectedSubjectId: string;
    selectedGroupId: string;
    selectedRubric: Rubric | null;
    setSelectedRubric: (rubric: Rubric | null) => void;
    handleSubjectChange: (subjectId: string) => void;
    setSubjectAndGroup: (subjectId: string, groupId: string) => void;
    resetSelection: () => void;
}
