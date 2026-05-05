import { Registration } from "./Registration";
import { Semester } from "./Semester";
import { Subject } from "./Subject";
import { Teacher } from "./Teacher";

export interface Group{
    semester?: Semester;
    registrations?: Registration[];
    teacher?: Teacher;
    subject?: Subject; 
}