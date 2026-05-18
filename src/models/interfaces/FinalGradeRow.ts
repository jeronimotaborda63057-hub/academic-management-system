import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";
import type { Registration } from "../uml/Registration";
import type { Student } from "../uml/Student";

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
