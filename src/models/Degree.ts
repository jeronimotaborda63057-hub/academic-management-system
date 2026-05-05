import { Curriculum } from "./Curriculum";
import { Enrollment } from "./Enrollment";

export interface Degree{
    name?: string;
    enrollments?: Enrollment[];
    curriculums?: Curriculum[];
}