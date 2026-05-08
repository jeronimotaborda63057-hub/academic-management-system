import type { Career } from "../models/Career";
import { BaseService } from "./baseService";

export class CareerService extends BaseService<Career> {
    constructor() {
        super("academic/careers")
    }
}