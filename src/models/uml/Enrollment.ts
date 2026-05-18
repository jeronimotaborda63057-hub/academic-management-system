import type { Career } from "./Career";
import type { Group } from "../Group";
import type { Student } from "./Student";

export type EnrollmentStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN";

export interface Enrollment {
    created_at?: string;
    enrollment_date?: string;
    group_id?: string;
    id?: string;
    status?: EnrollmentStatus;
    student_id?: string;
    updated_at?: string;
    student?: Student;
    career?: Career;
    group?: Group;
}
