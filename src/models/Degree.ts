import type { Curriculum } from "./Curriculum";
import type { Enrollment } from "./Enrollment";

export interface Degree{
    name?: string;
    enrollments?: Enrollment[];
    curriculums?: Curriculum[];
}