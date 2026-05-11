import { BaseService } from "./baseService";
import type { Career } from "../models/Career";

export class CareerService extends BaseService<Career> {
    constructor() {
        super("/academic/careers");
    }

    // ✔️ Soft delete (HU-02)
    async archive(id: string): Promise<Career | null> {
        return await this.update(id, { is_active: false });
    }
}

export const careerService = new CareerService();