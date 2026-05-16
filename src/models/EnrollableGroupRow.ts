import type { Group } from "./Group";
import type { Subject } from "./Subject";

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