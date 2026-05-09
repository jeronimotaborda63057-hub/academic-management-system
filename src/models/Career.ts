import type { Curriculum } from "./Curriculum";
import type { Enrollment } from "./Enrollment";

export interface Career{
    id: string;        
    name: string;
    code: string;      
    description?: string; 
    is_active: boolean;   
    enrollments?: Enrollment[];
    curriculums?: Curriculum[];
}