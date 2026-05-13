import type { Rubric } from "./Rubric";
import type { Scale } from "./Scale";

export interface Criteria {
    id?: string;
    rubric_id?: string;
    name?: string;
    description?: string;
    weight?: number;         // Peso porcentual (0–100)
    created_at?: string;
    updated_at?: string;
    rubric?: Rubric;
    scales?: Scale[];
}