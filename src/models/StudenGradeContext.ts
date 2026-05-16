import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";
import type { Group } from "./Group";
import type { Rubric } from "./Rubric";
import type { Subject } from "./Subject";
import type { Teacher } from "./Teacher";

export interface StudentGradeContext {
    evaluation?: Evaluation;
    grade?: Grade;
    group?: Group;
    rubric?: Rubric;
    subject?: Subject;
    teacher?: Teacher;
}