import { Rubric } from "./Rubric";
import { Subject } from "./Subject";

export interface Evaluation{
    subject?: Subject;
    rubric?: Rubric;
}