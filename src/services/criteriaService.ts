import type { Criteria } from "../models/Criteria";
import { BaseService } from "./baseService";

export class CriteriaService extends BaseService<Criteria> {
    constructor() {
        super("evaluation/criteria");
    }
}