import type { Evaluation } from "../uml/Evaluation";
import type { Rubric } from "../uml/Rubric";
import type { Subject } from "../uml/Subject";
import type { Teacher } from "../uml/Teacher";
import type { Criteria } from "./Criteria";
import type { Group } from "./Group";
import type { Scale } from "../uml/Scale";

export interface RubricConsultationRecord {
    evaluation: Evaluation;
    rubric: Rubric;
    subject?: Subject;
    group?: Group;
    teacher?: Teacher;
    criteria: Criteria[];
    scales: Scale[];
}