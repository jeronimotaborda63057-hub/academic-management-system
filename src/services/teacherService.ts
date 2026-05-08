import type { Teacher } from "../models/Teacher";
import { BaseService } from "./baseService";

export class TeacherService extends BaseService<Teacher> {
    constructor() {
        super("academic/teachers/search?identification=")
    }

}