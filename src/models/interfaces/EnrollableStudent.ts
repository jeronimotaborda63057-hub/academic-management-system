import type { Registration } from "../uml/Registration";
import type { Student } from "../uml/Student";

export interface EnrollableStudent {
    activeRegistration?: Registration;
    student: Student;
}