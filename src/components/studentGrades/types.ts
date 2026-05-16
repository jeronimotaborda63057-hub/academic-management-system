import type { Criteria } from "../../models/Criteria";
import type { Evaluation } from "../../models/Evaluation";
import type { Grade } from "../../models/Grade";
import type { Group } from "../../models/Group";
import type { Rubric } from "../../models/Rubric";
import type { Scale } from "../../models/Scale";
import type { Subject } from "../../models/Subject";
import type { Teacher } from "../../models/Teacher";

export interface StudentGradeSummaryRow {
    evaluationName: string;
    evaluationId?: string;
    finalScore: number;
    grade: Grade;
    groupName: string;
    id: string;
    subjectName: string;
    rubricTitle: string;
    status: string;
    teacherName: string;
    updatedAt?: string;
}

export interface StudentGradeDetailRow {
    comment?: string;
    criterion?: Criteria;
    possibleScore: number;
    scale?: Scale;
    score: number;
}

export interface StudentGradeContext {
    evaluation?: Evaluation;
    grade?: Grade;
    group?: Group;
    rubric?: Rubric;
    subject?: Subject;
    teacher?: Teacher;
}
