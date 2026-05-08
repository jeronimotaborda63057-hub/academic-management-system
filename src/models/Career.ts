import type { Curriculum } from "./Curriculum";
import type { Enrollment } from "./Enrollment";

export interface Career{
    name?: string;
    enrollments?: Enrollment[];
    curriculums?: Curriculum[];
}