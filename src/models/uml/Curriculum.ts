import type { Career } from "./Career";
import type { Subject } from "./Subject";

export interface Curriculum {
    career_id?: string;
    created_at?: string;
    id?: string;
    is_published?: boolean;
    name?: string;
    year?: number;           // ← versión del plan
    subject_id?: string;
    suggested_semester?: number;
    updated_at?: string;
    career?: Career;
    subject?: Subject;
}