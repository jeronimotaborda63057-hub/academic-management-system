import type { Curriculum } from "./Curriculum";
import type { Evaluation } from "./Evaluation";
import type { Group } from "./Group";

export interface Subject{
    code?: string;
    created_at?: string;
    credits?: number;
    description?: string;
    updated_at?: string;
    id?: string;
    name?: string;
    groups?: Group[];
    evaluation?: Evaluation;
    curriculums?: Curriculum[];
}