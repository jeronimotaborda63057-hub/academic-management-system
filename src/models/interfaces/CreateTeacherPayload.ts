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