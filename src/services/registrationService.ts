import type { Registration } from "../models/Registration";
import { BaseService } from "./baseService";

export class RegistrationService extends BaseService<Registration>{
    constructor (){
        super("academic/registrations");
    }
}   