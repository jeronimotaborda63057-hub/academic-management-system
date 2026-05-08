import type { Career } from "./Career";
import type { Subject } from "./Subject";

export interface Curriculum {
    career?: Career;
    subject?: Subject;
}