import type{ Registration } from "./Registration";
import type { Rubric } from "./Rubric";

export interface Grade {
    rubric?: Rubric;
    registration?: Registration;
}