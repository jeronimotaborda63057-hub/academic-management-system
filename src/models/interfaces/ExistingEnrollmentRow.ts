import type { Enrollment } from "../uml/Enrollment";
import type { Group } from "./Group";
import type { Subject } from "../uml/Subject";

export interface ExistingEnrollmentRow {
    enrollment: Enrollment;
    group?: Group;
    subject?: Subject;
}