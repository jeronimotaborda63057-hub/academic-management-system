export interface CreateAdminPayload {
    email: string;
    password: string;
    code: string;
    role: "ADMIN";
}