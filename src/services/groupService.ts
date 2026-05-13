import { api } from "../interceptors/authInterceptor";
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
}

export const groupService = new GroupService();