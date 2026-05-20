import type { Criteria } from "./Criteria";
import type { GradeDetail } from "./GradeDetail";

export interface Scale {
    created_at?: string;
    criterion_id?: string;
    description?: string;
    id?: string;
    name?: string;
    updated_at?: string;
    value?: number;
    criteria?: Criteria;
    gradeDetails?: GradeDetail[];
}

export interface CreateScaleDTO {
    criterion_id: string;
    description?: string;
    name: string;
    value: number;
}

export type UpdateScaleDTO = Partial<CreateScaleDTO>;
