import { BaseService } from "./baseService";
import type { Subject } from "../models/Subject";

class SubjectService extends BaseService<Subject> {
    constructor() {
        super("/academic/subjects/");
    }

    // ✅ HU-04 criterio 3: archivar en vez de eliminar
    async archive(id: string): Promise<Subject | null> {
        return this.update(id, { is_active: false });
    }
}

export const subjectService = new SubjectService();