import type { Grade } from "./Grade";
import type { Group } from "./Group";
import type { Student } from "./Student";
import type { Career } from "./Career";

export interface Registration {
    academic_status?: string;
    admission_period?: string;
    career_id?: string;
    created_at?: string;
    id?: string;
    is_active?: boolean;
    student_id?: string;
    updated_at?: string;
    career?: Career;
    group?: Group;
    student?: Student;
    grades?: Grade[];
}

export type AcademicRegistrationStatus =
    | "ACTIVE"
    | "WITHDRAWN"
    | "SUSPENDED"
    | "GRADUATED";

export interface CreateCareerRegistrationPayload {
    academic_status: AcademicRegistrationStatus;
    admission_period: string;
    career_id: string;
    is_active: boolean;
    student_id: string;
}
