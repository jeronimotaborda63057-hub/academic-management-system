import type { Grade } from "./Grade";
import type { Registration } from "./Registration";
import type { Student } from "./Student";

export interface GradingStudent {
    enrollmentId: string;
    registration: Registration;
    student?: Student;
    studentId: string;
    grade?: Grade;
}

export type GradeDraft = Record<string, { scaleId: string; comment: string }>;
