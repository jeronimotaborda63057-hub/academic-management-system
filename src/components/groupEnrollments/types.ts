import type { Enrollment } from "../../models/Enrollment";
import type { Group } from "../../models/Group";
import type { Registration } from "../../models/Registration";
import type { Student } from "../../models/Student";
import type { Subject } from "../../models/Subject";

export interface EnrollableStudent {
    activeRegistration?: Registration;
    student: Student;
}

export interface EnrollableGroupRow {
    activeEnrollmentCount: number;
    availableSpots: number;
    credits: number;
    group: Group;
    id: string;
    isAlreadyEnrolled: boolean;
    isFromActiveSemester: boolean;
    isInCareerPlan: boolean;
    subject?: Subject;
}

export interface ExistingEnrollmentRow {
    enrollment: Enrollment;
    group?: Group;
    subject?: Subject;
}
