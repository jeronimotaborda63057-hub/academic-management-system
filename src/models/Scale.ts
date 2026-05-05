import { Criteria } from "./Criteria";
import { GradeDetail } from "./GradeDetail";

export interface Scale {
    criteria?: Criteria;
    gradeDetails?: GradeDetail[];
}