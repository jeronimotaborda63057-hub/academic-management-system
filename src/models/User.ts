import type { CreateAdminPayload } from "./CreateAdminPayload";
import type { CreateStudentPayload } from "./CreateStudentPayload";
import type { CreateTeacherPayload } from "./CreateTeacherPayload";
import type { StudentProfile } from "./StudentProfile";
import type { TeacherProfile } from "./TeacherProfile";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";


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

export type CreateUserPayload = CreateAdminPayload | CreateTeacherPayload | CreateStudentPayload;
