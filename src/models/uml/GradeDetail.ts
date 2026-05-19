import type { Grade } from "./Grade";
import type { Scale } from "./Scale";
import type { Student } from "./Student";

export interface GradeDetail {
    id?: string;
    grade_id?: string;
    scale_id?: string;
    student_id?: string;
    score?: number;
    comment?: string;
    created_at?: string;
    updated_at?: string;
    grade?: Grade;
    students?: Student;
    scale?: Scale;

}
