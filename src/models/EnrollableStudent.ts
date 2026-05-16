import type { Registration } from "./Registration";
import type { Student } from "./Student";

export interface EnrollableStudent {
    activeRegistration?: Registration;
    student: Student;
}