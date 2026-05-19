import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";
import type { Group } from "./Group";
import type { Rubric } from "../uml/Rubric";
import type { Subject } from "../uml/Subject";
import type { Teacher } from "../uml/Teacher";

export interface StudentGradeContext {
    evaluation?: Evaluation;
    grade?: Grade;
    group?: Group;
    rubric?: Rubric;
    subject?: Subject;
    teacher?: Teacher;
}