import type { Rubric } from "./Rubric";
import type { Subject } from "./Subject";

export interface Evaluation{
    subject?: Subject;
    rubric?: Rubric;
}