import type { GradeDetail } from "../models/GradeDetail";
import { BaseService } from "./baseService";

export class GradeDetailService extends BaseService<GradeDetail> {
    constructor() {
        super("evaluation/grade-details");
    }
}