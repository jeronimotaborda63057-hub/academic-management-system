import { Degree } from "./Degree";
import { Student } from "./Student";

export interface Enrollment{
    student?: Student;
    degree?: Degree;
}