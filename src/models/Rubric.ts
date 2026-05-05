import { Criteria } from "./Criteria";
import { Evaluation } from "./Evaluation";
import { Grade } from "./Grade";

export interface Rubric {
    criteria?: Criteria[];
    evaluations?: Evaluation[];
    grades?: Grade[];
}