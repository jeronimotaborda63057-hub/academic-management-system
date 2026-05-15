import type { Student } from "../models/Student";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class StudentService extends BaseService<Student>{
    constructor(){
        super("academic/students");
    }

    async getAllWithAuth(): Promise<Student[]> {
        const response = await api.get<{ data: Student[] }>(this.apiURL);
        return response.data.data ?? [];
    }
}

export const studentService = new StudentService();
