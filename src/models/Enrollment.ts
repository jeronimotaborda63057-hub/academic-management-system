import type { Career } from "./Career";
import type { Student } from "./Student";

export interface Enrollment {
    created_at?: string;
    enrollment_date?: string;
    group_id?: string;
    id?: string;
    status?: string;
    student_id?: string;
    updated_at?: string;
    student?: Student;
    career?: Career;
}