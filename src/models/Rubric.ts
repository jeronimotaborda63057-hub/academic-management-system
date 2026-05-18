import type { Criteria } from "./Criteria";
import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";

export interface Rubric {
    id?: string;
    title: string;
    description?: string;
    subject_id?: string;
    is_public?: boolean;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
    criteria?: Criteria[];
    evaluations?: Evaluation[];
    grades?: Grade[];
}