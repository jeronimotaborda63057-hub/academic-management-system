import type { Criteria } from "./Criteria";
import type { GradeDetail } from "./GradeDetail";

export interface Scale {
    criteria?: Criteria;
    gradeDetails?: GradeDetail[];
}