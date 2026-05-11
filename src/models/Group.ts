import type { Registration } from "./Registration";
import type { Semester } from "./Semester";
import type { Subject } from "./Subject";
import type { Teacher } from "./Teacher";

export interface Group {
    capacity?: number;
    created_at?: string;
    group_code?: string;
    id?: string;
    name?: string;
    semester_id?: string;
    subject_id?: string;
    teacher_id?: string;
    updated_at?: string;
    semester?: Semester;
    registrations?: Registration[];
    teacher?: Teacher;
    subject?: Subject;
}