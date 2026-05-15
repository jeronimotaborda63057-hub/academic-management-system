import type { Evaluation } from "../../models/Evaluation";
import type { Grade } from "../../models/Grade";
import type { Registration } from "../../models/Registration";
import type { Student } from "../../models/Student";

export interface FinalGradeRow {
    completedEvaluations: number;
    finalScore: number;
    grades: Grade[];
    incompleteEvaluations: Evaluation[];
    isComplete: boolean;
    isLocked: boolean;
    registration: Registration;
    student?: Student;
    studentId: string;
}
