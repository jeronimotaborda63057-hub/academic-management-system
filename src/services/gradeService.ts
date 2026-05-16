import type { Grade } from "../models/Grade";
import { BaseService } from "./baseService";

export class GradeService extends BaseService<Grade> {
    constructor() {
        super("evaluation/grades");
    }
}

export const gradeService = new GradeService();