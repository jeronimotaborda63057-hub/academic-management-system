import type { Teacher } from "../models/Teacher";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class TeacherService extends BaseService<Teacher> {
    constructor() {
        super("academic/teachers/search?identification=")
    }

    async getAllWithAuth(): Promise<Teacher[]> {
        const response = await api.get<{ data: Teacher[] }>("academic/teachers");
        return response.data.data ?? [];
    }

}

export const teacherService = new TeacherService();
