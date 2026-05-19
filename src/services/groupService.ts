import { api } from "../interceptors/authInterceptor";
import type { Group } from "../models/uml/Group";
import { BaseService } from "./baseService";

type SearchFilters = Record<string, string | number | boolean | undefined>;

export class GroupService extends BaseService<Group> {
    constructor() {
        super("academic/groups");
    }

    async search(filters: SearchFilters): Promise<Group[]> {
        try {
            const response = await api.get<{ data: Group[] }>(
                `${this.apiURL}/search`,
                { params: filters }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error al buscar grupos:", error);
            return [];
        }
    }

    async getAllWithAuth(): Promise<Group[]> {
        const response = await api.get<{ data: Group[] }>(this.apiURL);
        return response.data.data ?? [];
    }

    async getByTeacher(teacherId: string): Promise<Group[]> {
        const groups = await this.getAllWithAuth();
        return groups.filter((group) => group.teacher_id === teacherId);
    }

    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<any> {
        try {
            const response = await api.patch(
                `${this.apiURL}/${groupId}/assign-teacher/${teacherId}`
            );
            return response.data.data
            
        } catch (error) {
            console.error("Error al asignar docente a grupo: ", error)
            return null
        }
    }
}

export const groupService = new GroupService();
