import type { Criteria } from "./Criteria";
import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";

export interface Rubric {
    criteria?: Criteria[];
    evaluations?: Evaluation[];
    grades?: Grade[];
}