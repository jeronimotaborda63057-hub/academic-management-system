import { BaseService } from "./baseService";
import type { Subject } from "../models/Subject";
import { api } from "../interceptors/authInterceptor";

class SubjectService extends BaseService<Subject> {
    constructor() {
        super("/academic/subjects");
    }

    // ✅ HU-04 criterio 3: archivar en vez de eliminar
    async archive(id: string): Promise<Subject | null> {
        return this.update(id, { is_active: false });
    }

    async getAllWithAuth(): Promise<Subject[]> {
        const response = await api.get<{ data: Subject[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const subjectService = new SubjectService();
