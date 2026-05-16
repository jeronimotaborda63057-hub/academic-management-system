import type { Enrollment } from "./Enrollment";
import type { Group } from "./Group";
import type { Subject } from "./Subject";

export interface ExistingEnrollmentRow {
    enrollment: Enrollment;
    group?: Group;
    subject?: Subject;
}