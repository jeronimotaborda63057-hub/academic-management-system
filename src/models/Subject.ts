import type { Curriculum } from "./Curriculum";
import type { Evaluation } from "./Evaluation";
import type { Group } from "./Group";

export interface Subject{
    name?: string;
    groups?: Group[];
    evaluation?: Evaluation;
    curriculums?: Curriculum[];
}