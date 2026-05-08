import type { Group } from "../models/Group";
import { BaseService } from "./baseService";

export class GroupService extends BaseService<Group> {
    constructor (){
        super("academic/groups");
    }
}