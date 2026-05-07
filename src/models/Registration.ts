import type { Grade } from "./Grade";
import type { Group } from "./Group";
import type { Student } from "./Student";

export interface Registration {
    group?: Group;
    student?: Student;
    grades?: Grade[];
}