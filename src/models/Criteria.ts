import type { Rubric } from "./Rubric";
import type { Scale } from "./Scale";

export interface Criteria{
    id: string;
    name: string;
    description?: string | "...";
    rubric?: Rubric;
    rubric_id?: String;
    scales?: Scale[];
    weight: number;
}