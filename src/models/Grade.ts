import { Registration } from "./Registration";
import { Rubric } from "./Rubric";

export interface Grade {
    rubric?: Rubric;
    registration?: Registration;
}