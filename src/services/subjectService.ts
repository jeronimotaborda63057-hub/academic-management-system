import type { Subject } from "../models/Subject";
import { BaseService } from "./baseService";

export class SubjectService extends BaseService<Subject>{
    constructor(){
        super("/academic/subjects");
    }
}

export const subjectService = new SubjectService();