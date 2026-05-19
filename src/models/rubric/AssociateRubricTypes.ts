import type { Rubric } from "../Rubric";
import type { Subject } from "../Subject";

export interface EvaluationOption {
    id: string;
    name: string;
    weight: number;
    description: string;
    group_id?: string;
    id_group?: string;
}

export interface GroupOption {
    id?: string;
    group_id?: string;
    id_group?: string;
    subject_id?: string;
    id_subject?: string;
    subject?: { id: string };
}

// Re-exports para no dispersar imports
export type { Rubric, Subject };