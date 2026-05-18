import type { CreateAdminPayload } from "../interfaces/CreateAdminPayload";
import type { CreateStudentPayload } from "../interfaces/CreateStudentPayload";
import type { CreateTeacherPayload } from "../interfaces/CreateTeacherPayload";
import type { StudentProfile } from "../interfaces/StudentProfile";
import type { TeacherProfile } from "../interfaces/TeacherProfile";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
    id: string;
    email: string;
    code: string;
    role: UserRole;
    is_active: boolean;
    display_name?: string;
    photo_url?: string;
    created_at?: string;
    updated_at?: string;
    profile?: TeacherProfile | StudentProfile;
}

export type CreateUserPayload = CreateAdminPayload | CreateTeacherPayload | CreateStudentPayload;
