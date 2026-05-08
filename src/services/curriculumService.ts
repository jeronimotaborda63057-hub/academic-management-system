import type { Curriculum } from "../models/Curriculum";
import { BaseService } from "./baseService";

export class CurriculumService extends BaseService<Curriculum> {
    constructor() {
        super("academic/study-plans");
    }
}