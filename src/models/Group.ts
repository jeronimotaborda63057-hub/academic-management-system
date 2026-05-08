import type { Registration } from "./Registration";
import type { Semester } from "./Semester";
import type { Subject } from "./Subject";
import type { Teacher } from "./Teacher";

export interface Group{
    semester?: Semester;
    registrations?: Registration[];
    teacher?: Teacher;
    subject?: Subject; 
}