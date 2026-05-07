import type { Group } from './Group';
import type { Enrollment } from './Enrollment';
import type { GradeDetail } from './GradeDetail';
export interface Student {
    id?: string;
    name?: string;
    email?: string;
    groups?: Group[];
    enrollments?: Enrollment[];
    gradeDetails?: GradeDetail[];
}