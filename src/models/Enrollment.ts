import type { Degree } from "./Degree";
import type { Student } from "./Student";

export interface Enrollment{
    student?: Student;
    degree?: Degree;
}