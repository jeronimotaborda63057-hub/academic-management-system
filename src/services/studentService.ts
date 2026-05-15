import type { Student } from "../models/Student";
import { BaseService } from "./baseService";

export class StudentService extends BaseService<Student>{
    constructor(){
        super("academic/students");
    }
}

export const studentService = new StudentService();
