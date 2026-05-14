import type { Group } from './Group';
import type { Enrollment } from './Enrollment';
import type { GradeDetail } from './GradeDetail';
export interface Student {
    created_at?: string;
    first_name?: string;
    id?: string;
    identification?: string;
    last_name?: string;
    updated_at?: string;
    user_id?: string;

    groups?: Group[];
    enrollments?: Enrollment[];
    gradeDetails?: GradeDetail[];
}