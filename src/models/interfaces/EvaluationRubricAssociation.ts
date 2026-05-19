import type { Evaluation } from "../uml/Evaluation";
import type { Rubric } from "../uml/Rubric";
import type { Subject } from "../uml/Subject";

export interface EvaluationRubricAssociation {
    evaluation: Evaluation;
    rubric: Rubric;
    subject: Subject;
}