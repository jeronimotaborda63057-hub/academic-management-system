import type { Grade } from "./Grade";
import type { Group } from "./Group";
import type { Student } from "./Student";

export interface Registration {
    academic_status?: string;
    admission_period?: string;
    career_id?: string;
    created_at?: string;
    id?: string;
    is_active?: boolean;
    student_id?: string;
    updated_at?: string;
    group?: Group;
    student?: Student;
    grades?: Grade[];
}