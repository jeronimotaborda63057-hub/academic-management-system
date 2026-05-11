import type { Criteria } from "./Criteria";
import type { Evaluation } from "./Evaluation";
import type { Grade } from "./Grade";

export interface Rubric {
    created_at?: string;
    description?: string;
    id?: string;
    is_archived?: boolean;
    is_public?: boolean;
    subject_id?: string;
    title?: string;
    updated_at?: string;
    criteria?: Criteria[];
    evaluations?: Evaluation[];
    grades?: Grade[];
}