import type { Curriculum } from "./Curriculum";
import type { Enrollment } from "./Enrollment";

export interface Career{
    code: string; 
    created_at?: string;
    description?: string;
    id: string;       
    is_active: boolean;    
    name: string;
    updated_at?: string;     
    enrollments?: Enrollment[];
    curriculums?: Curriculum[];
}