import type { EvaluationOption, GroupOption, Rubric, Subject } from "./AssociateRubricTypes";

export interface CatalogsState {
    evaluations: EvaluationOption[];
    rubrics: Rubric[];
    subjects: Subject[];
    groups: GroupOption[];
    loading: boolean;
}
