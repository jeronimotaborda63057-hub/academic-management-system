import type { Evaluation } from "./Evaluation";
import type { Rubric } from "./Rubric";
import type { Subject } from "./Subject";

export interface EvaluationRubricAssociation {
    evaluation: Evaluation;
    rubric: Rubric;
    subject: Subject;
}