import axios from "axios";
import type { Teacher } from "../models/Teacher";
import { BaseService } from "./baseService";

export class TeacherService extends BaseService<Teacher> {
    constructor() {
        super("academic/teachers/search?identification=")
    }

    async getTeacherById(id: number): Promise<Teacher | null> {
        try {
            const response = await axios.get<Teacher>(`${this.apiURL}/${id}`)
            return response.data;
        } catch (error) {
            console.error("Error al conseguir docente: " + error);
            return null;
        }
    }
}