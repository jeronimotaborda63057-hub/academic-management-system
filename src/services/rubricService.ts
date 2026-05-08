import type { Rubric } from "../models/Rubric";
import { BaseService } from "./baseService";

export class RubricService extends BaseService<Rubric>{
    constructor(){
        super("evaluation/rubrics");
    }
}