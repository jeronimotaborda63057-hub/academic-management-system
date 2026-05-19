import type { Grade } from "../uml/Grade";
import type { Registration } from "../uml/Registration";
import type { Student } from "../uml/Student";

export interface GradingStudent {
    enrollmentId: string;
    registration: Registration;
    student?: Student;
    studentId: string;
    grade?: Grade;
}

export type GradeDraft = Record<string, { scaleId: string; comment: string }>;
