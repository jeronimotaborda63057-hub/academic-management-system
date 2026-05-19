import { BaseService } from "./baseService";
import type { Career } from "../models/uml/Career";

class CareerService extends BaseService<Career> {
    constructor() {
        super("/academic/careers");
    }

    async archive(id: string): Promise<Career | null> {
        return this.update(id, { is_active: false });
    }

    
}

export const careerService = new CareerService();