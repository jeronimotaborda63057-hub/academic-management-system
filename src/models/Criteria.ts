import { Rubric } from "./Rubric";
import { Scale } from "./Scale";

export interface Criteria{
    rubric?: Rubric;
    scales?: Scale[];
}