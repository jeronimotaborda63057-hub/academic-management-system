import type { Semester } from "../models/Semester";
import { BaseService } from "./baseService";

export class SemesterService extends BaseService<Semester>{
    constructor(){
        super("academic/semesters");
    }
}