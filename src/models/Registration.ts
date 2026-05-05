import { Grade } from "./Grade";
import { Group } from "./Group";
import { Student } from "./Student";

export interface Registration {
    group?: Group;
    student?: Student;
    grades?: Grade[];
}