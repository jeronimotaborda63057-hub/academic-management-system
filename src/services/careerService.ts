import { BaseService } from "./baseService";
import type { Career } from "../models/Career";

export class CareerService extends BaseService<Career> {
    constructor() {
        super("/academic/careers");
    }

    async archive(id: number): Promise<Career | null> {
        return this.update(id, { is_active: false });
    }
}

export const careerService = new CareerService();