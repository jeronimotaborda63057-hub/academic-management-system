import type { Career } from "../models/Career";
import { BaseService } from "./baseService";

class CareerService extends BaseService<Career> {
    constructor() {
        super("/api/academic/careers")
    }
}

export const careerService = new CareerService();