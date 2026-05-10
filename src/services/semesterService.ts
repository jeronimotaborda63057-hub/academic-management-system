import { BaseService } from "./baseService";
import type { Semester } from "../models/Semester";

export class SemesterService extends BaseService<Semester> {
    constructor() { super("/semesters") }

    // HU-02 criterio 4: activar un semestre y desactiva los demás
    async setActive(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: true });
    }

    async close(id: string): Promise<Semester | null> {
        return this.update(id, { is_active: false });
    }
}