import type { Rubric } from "./Rubric";
import type { Scale } from "./Scale";

export interface Criteria{
    rubric?: Rubric;
    scales?: Scale[];
}