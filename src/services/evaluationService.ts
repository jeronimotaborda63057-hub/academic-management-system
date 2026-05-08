import type { Evaluation } from "../models/Evaluation";
import { BaseService } from "./baseService";

export class EvaluationService extends BaseService<Evaluation> {
    constructor() {
        super("evaluation/evaluations");
    }
}