import { api } from "./baseService";
import type { Group } from "../models/Group";
import { BaseService } from "./baseService";

export class GroupService extends BaseService<Group> {
    constructor() {
        super("academic/groups");
    }

    async search(filters: Record<string, any>): Promise<Group[]> {
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