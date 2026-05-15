import { BaseService } from "./baseService";
import type { Semester } from "../models/Semester";

class SemesterService extends BaseService<Semester> {
    constructor() {
        super("/academic/semesters");
    }

    async getByCareer(careerId: string): Promise<Semester[]> {
        return await this.getAll();
    }

    async setActive(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: true });
    }

    async close(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: false });
    }
}

export const semesterService = new SemesterService();