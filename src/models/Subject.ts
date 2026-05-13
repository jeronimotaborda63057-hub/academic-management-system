import type { Curriculum } from "./Curriculum";
import type { Evaluation } from "./Evaluation";
import type { Group } from "./Group";
import type { SubjectCurriculum } from "./SubjectCurriculum";

export interface Subject{
    code: string;
    created_at?: string;
    credits: number;
    description?: string;
    updated_at?: string;
    id: string;
    name: string;
    is_active: boolean;

    groups?: Group[];
    subject_curriculums?: SubjectCurriculum[];
    evaluation?: Evaluation[];
    curriculums?: Curriculum[];
}

export type SubjectForm = Omit<Subject, "id" | "created_at" | "updated_at">;