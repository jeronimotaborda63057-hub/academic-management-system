import type { Criteria } from "./Criteria";
import type { Scale } from "../uml/Scale";

export interface StudentGradeDetailRow {
    comment?: string;
    criterion?: Criteria;
    possibleScore: number;
    scale?: Scale;
    score: number;
}