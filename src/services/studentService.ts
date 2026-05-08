import type { Student } from "../models/Student";
import { BaseService } from "./baseService";

export class StudentService extends BaseService<Student>{
    constructor(){
        super("academic/students/search?identification=1001001");
    }
}