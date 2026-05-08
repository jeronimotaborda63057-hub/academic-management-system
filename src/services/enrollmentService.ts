import type { Enrollment } from "../models/Enrollment";
import { BaseService } from "./baseService";

export class EnrollmentService extends BaseService<Enrollment> {
    constructor() {
        super("academic/enrollments");
    }
}