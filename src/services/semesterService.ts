import { BaseService } from "./baseService";
import type { Semester } from "../models/Semester";
import { api } from "../interceptors/authInterceptor";

class SemesterService extends BaseService<Semester> {
    constructor() {
        super("/academic/semesters");
    }

    async getByCareer(careerId: string): Promise<Semester[]> {
        const all = await this.getAll();
        return all.filter((s) => s.career_id === careerId);
    }

    async setActive(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: true });
    }

    async close(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: false });
    }

    async getAllWithAuth(): Promise<Semester[]> {
        const response = await api.get<{ data: Semester[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const semesterService = new SemesterService();
