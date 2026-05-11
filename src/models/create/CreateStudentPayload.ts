export interface CreateStudentPayload {
    email: string;
    password: string;
    code: string;
    role: "STUDENT";
    first_name: string;
    last_name: string;
    identification: string;
}