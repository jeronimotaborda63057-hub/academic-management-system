import {Group} from './Group';
import {Enrollment} from './Enrollment';
import { GradeDetail } from './GradeDetail';
export interface Student {
    id?: string;
    name?: string;
    email?: string;
    groups?: Group[];
    enrollments?: Enrollment[];
    gradeDetails?: GradeDetail[];
}