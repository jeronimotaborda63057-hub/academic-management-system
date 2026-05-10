import type { UserRole } from "./User";

export interface UserFilters {
    role?: UserRole;
    is_active?: boolean;
    email?: string;
    code?: string;
    identification?: string;
    first_name?: string;
    last_name?: string;
}