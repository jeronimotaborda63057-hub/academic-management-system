import type { Group } from "./Group";

export interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    identification: string;
    phone?: number | null;
    specialty?: string | null;
    updated_at?: string;
    user_id: string;
    groups?: Group[];
}