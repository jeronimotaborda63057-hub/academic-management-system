import { BaseService } from "./baseService";
import type { Semester } from "../models/uml/Semester";
import { api } from "../interceptors/authInterceptor";

class SemesterService extends BaseService<Semester> {
    constructor() {
        super("/academic/semesters");
    }

    private normalizeDate(value?: string): string | undefined {
        if (!value) return value;
        return value.slice(0, 10);
    }

    private normalizePayload<T extends Partial<Semester>>(data: T): T {
        return {
            ...data,
            start_date: this.normalizeDate(data.start_date),
            end_date: this.normalizeDate(data.end_date),
        };
    }

    async create(data: Omit<Semester, "id" | "created_at" | "updated_at">): Promise<Semester | null> {
        return super.create(this.normalizePayload(data));
    }

    async update(id: string, data: Partial<Semester>): Promise<Semester | null> {
        return super.update(id, this.normalizePayload(data));
    }

    async getByCareer(_careerId: string): Promise<Semester[]> {
        return this.getAll();
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
