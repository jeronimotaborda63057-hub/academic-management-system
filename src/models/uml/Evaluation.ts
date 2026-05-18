import type { Rubric } from "./Rubric";
import type { Subject } from "./Subject";

export interface Evaluation {
    created_at?: string;
    description?: string;
    group_id?: string;
    id?: string;
    name?: string;
    rubric_id?: string;
    subject_id?: string;
    updated_at?: string;
    weight?: number;
    subject?: Subject;
    rubric?: Rubric;
}