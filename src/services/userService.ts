import type { User } from "../models/User";
import { BaseService } from "./baseService";

export class UserService extends BaseService<User>{
    constructor(){
        super("users");
    }
}