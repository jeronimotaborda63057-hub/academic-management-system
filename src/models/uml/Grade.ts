import type { Enrollment } from "./uml/Enrollment";
import type { Evaluation } from "./Evaluation";
import type { GradeDetail } from "./GradeDetail";
import type { Registration } from "./Registration";
import type { Rubric } from "./Rubric";
import type { Student } from "./Student";

export interface Grade {
    id?: string;
    evaluation_id?: string;
    enrollment_id?: string;
    registration_id?: string;
    rubric_id?: string;
    student_id?: string;
    final_score?: number;
    is_locked?: boolean;
    note_final?: number;
    nota_final?: number;
    is_submitted?: boolean;
    status?: "DRAFT" | "SUBMITTED" | string;
    observations?: string;
    created_at?: string;
    updated_at?: string;
    details?: GradeDetail[];
    evaluation?: Evaluation;
    enrollment?: Enrollment;
    rubric?: Rubric;
    registration?: Registration;
    student?: Student;
}
