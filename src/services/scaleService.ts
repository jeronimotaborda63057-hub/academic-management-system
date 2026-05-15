import type { Scale, UpdateScaleDTO } from "../models/Scale";
import { BaseService } from "./baseService";

export class ScaleService extends BaseService<Scale> {
    constructor() {
        super("evaluation/scales");
    }
}

export const scaleService = new ScaleService();