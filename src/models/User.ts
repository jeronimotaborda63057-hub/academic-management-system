export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
    id: string;          
    email: string;
    password_hash: string;
    code: string;
    role: UserRole;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}