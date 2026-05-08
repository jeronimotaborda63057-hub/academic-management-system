import type { Career } from "./Career";
import type { Student } from "./Student";

export interface Enrollment {
    student?: Student;
    career?: Career;
}