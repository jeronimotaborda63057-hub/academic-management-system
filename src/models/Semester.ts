import type { Career } from "./Career";
export interface Semester {
    id: string;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    carrers?: Career[];
}