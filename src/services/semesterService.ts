import { BaseService } from "./baseService";
import type { Semester } from "../models/Semester";

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
}

export const semesterService = new SemesterService();