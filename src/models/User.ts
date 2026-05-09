export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

// --- PERFILES ---

export interface TeacherProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    identification: string;
    specialty?: string;
}

export interface StudentProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    identification: string;
}

// --- USUARIO (lo que devuelve el backend) ---

export interface User {
    id: string;
    email: string;
    code: string;
    role: UserRole;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    profile?: TeacherProfile | StudentProfile;
}

// --- PAYLOADS DE CREACIÓN (lo que se manda al backend) ---

export interface CreateAdminPayload {
    email: string;
    password: string;
    code: string;
    role: "ADMIN";
}

export interface CreateTeacherPayload {
    email: string;
    password: string;
    code: string;
    role: "TEACHER";
    first_name: string;
    last_name: string;
    identification: string;
    phone?: string;
    specialty?: string;
}

export interface CreateStudentPayload {
    email: string;
    password: string;
    code: string;
    role: "STUDENT";
    first_name: string;
    last_name: string;
    identification: string;
}

export type CreateUserPayload = CreateAdminPayload | CreateTeacherPayload | CreateStudentPayload;

// --- FILTROS DE BÚSQUEDA ---

export interface UserFilters {
    role?: UserRole;
    is_active?: boolean;
    email?: string;
    code?: string;
    identification?: string;
    first_name?: string;
    last_name?: string;
}