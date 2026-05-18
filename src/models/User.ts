import type { CreateAdminPayload } from "./create/CreateAdminPayload";
import type { CreateStudentPayload } from "./create/CreateStudentPayload";
import type { CreateTeacherPayload } from "./create/CreateTeacherPayload";
import type { StudentProfile } from "./StudentProfile";
import type { TeacherProfile } from "./TeacherProfile";

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
