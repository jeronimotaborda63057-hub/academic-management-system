import type { Grade } from "./Grade";

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
    subjectId: string;
}