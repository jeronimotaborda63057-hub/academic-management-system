import type { Career } from "../models/Career";
import { BaseService } from "./baseService";

export class CareerService extends BaseService<Career> {
    constructor() {
        super("api/academic/careers")
    }
}

export const carrerService = new CareerService();