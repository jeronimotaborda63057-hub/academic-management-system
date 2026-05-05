import { Curriculum } from "./Curriculum";
import { Evaluation } from "./Evaluation";
import { Group } from "./Group";

export interface Subject{
    name?: string;
    groups?: Group[];
    evaluation?: Evaluation;
    curriculums?: Curriculum[];
}