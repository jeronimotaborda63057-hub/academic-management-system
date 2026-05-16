import { useEffect, useMemo, useState } from "react";

import type { Curriculum } from "../models/Curriculum";
import type { Enrollment } from "../models/Enrollment";
import type { Group } from "../models/Group";
import type { Registration } from "../models/Registration";
import type { Semester } from "../models/Semester";
import type { Student } from "../models/Student";
import type { Subject } from "../models/Subject";
import type {
    EnrollableGroupRow,
    EnrollableStudent,
    ExistingEnrollmentRow,
} from "../components/groupEnrollments/types";
import { curriculumService } from "../services/curriculumService";
import { enrollmentService } from "../services/enrollmentService";
import { groupService } from "../services/groupService";
import { registrationService } from "../services/registrationService";
import { semesterService } from "../services/semesterService";
import { studentService } from "../services/studentService";
import { subjectService } from "../services/subjectService";

const MAX_CREDITS = 18;

const matchesStudentSearch = (student: Student, search: string) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
        student.first_name,
        student.last_name,
        student.identification,
    ].some((value) => value?.toLowerCase().includes(query));
};

const getActiveRegistration = (
    registrations: Registration[],
    studentId?: string
) =>
    registrations.find(
        (registration) =>
            registration.student_id === studentId &&
            (registration.is_active === true ||
                registration.academic_status === "ACTIVE")
    );

const getPlanSubjectIds = (
    curriculums: Curriculum[],
    careerId?: string
) => {
    const plans = curriculums.filter(
        (plan) => plan.career_id === careerId && plan.is_published !== false
    );

    return new Set(
        plans
            .map((plan) => plan.subject_id)
            .filter((subjectId): subjectId is string => Boolean(subjectId))
    );
};

export const useGroupEnrollment = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeSemester = useMemo(
        () => semesters.find((semester) => semester.is_active),
        [semesters]
    );

    const enrollableStudents = useMemo<EnrollableStudent[]>(
        () =>
            students
                .filter((student) => matchesStudentSearch(student, search))
                .map((student) => ({
                    student,
                    activeRegistration: getActiveRegistration(registrations, student.id),
                })),
        [registrations, search, students]
    );

    const selectedStudent = useMemo(
        () => enrollableStudents.find((item) => item.student.id === selectedStudentId),
        [enrollableStudents, selectedStudentId]
    );

    const selectedPlanSubjectIds = useMemo(
        () =>
            getPlanSubjectIds(
                curriculums,
                selectedStudent?.activeRegistration?.career_id
            ),
        [curriculums, selectedStudent?.activeRegistration?.career_id]
    );

    const activeStudentEnrollments = useMemo(
        () =>
            enrollments.filter(
                (enrollment) =>
                    enrollment.student_id === selectedStudentId &&
                    enrollment.status === "ACTIVE"
            ),
        [enrollments, selectedStudentId]
    );

    const existingEnrollmentRows = useMemo<ExistingEnrollmentRow[]>(
        () =>
            activeStudentEnrollments.map((enrollment) => {
                const group = groups.find((item) => item.id === enrollment.group_id);
                const subject = subjects.find((item) => item.id === group?.subject_id);

                return { enrollment, group, subject };
            }),
        [activeStudentEnrollments, groups, subjects]
    );

    const groupRows = useMemo<EnrollableGroupRow[]>(() => {
        const activeSemesterGroups = groups.filter(
            (group) => group.semester_id === activeSemester?.id
        );
        const visibleGroups = activeSemesterGroups.length > 0
            ? activeSemesterGroups
            : groups;

        return visibleGroups
            .filter((group) => group.subject_id && group.teacher_id)
            .map((group) => {
                const subject = subjects.find((item) => item.id === group.subject_id);
                const activeEnrollmentCount = enrollments.filter(
                    (enrollment) =>
                        enrollment.group_id === group.id &&
                        enrollment.status === "ACTIVE"
                ).length;
                const isAlreadyEnrolled = activeStudentEnrollments.some(
                    (enrollment) => enrollment.group_id === group.id
                );
                const isInCareerPlan = group.subject_id
                    ? selectedPlanSubjectIds.has(group.subject_id)
                    : false;

                return {
                    activeEnrollmentCount,
                    availableSpots: Math.max((group.capacity ?? 0) - activeEnrollmentCount, 0),
                    credits: subject?.credits ?? 0,
                    group,
                    id: group.id ?? "",
                    isAlreadyEnrolled,
                    isFromActiveSemester: Boolean(
                        activeSemester?.id && group.semester_id === activeSemester.id
                    ),
                    isInCareerPlan,
                    subject,
                };
            });
    }, [
        activeSemester?.id,
        activeStudentEnrollments,
        enrollments,
        groups,
        selectedPlanSubjectIds,
        subjects,
    ]);

    const selectedGroups = useMemo(
        () => groupRows.filter((row) => selectedGroupIds.includes(row.id)),
        [groupRows, selectedGroupIds]
    );

    const selectedCredits = useMemo(
        () => selectedGroups.reduce((total, row) => total + row.credits, 0),
        [selectedGroups]
    );

    const hasOutOfPlanSelection = selectedGroups.some((row) => !row.isInCareerPlan);

    const validationError = useMemo(() => {
        if (!selectedStudentId) return "Selecciona un estudiante.";
        if (!selectedStudent?.activeRegistration) {
            return "El estudiante no tiene una matricula activa en una carrera.";
        }
        if (selectedGroupIds.length === 0) return "Selecciona al menos un grupo.";
        if (selectedCredits > MAX_CREDITS) {
            return `La seleccion suma ${selectedCredits} creditos y supera el limite de ${MAX_CREDITS}.`;
        }
        const withoutCapacity = selectedGroups.find((row) => row.availableSpots <= 0);
        if (withoutCapacity) return "Uno de los grupos seleccionados no tiene cupos disponibles.";
        const duplicate = selectedGroups.find((row) => row.isAlreadyEnrolled);
        if (duplicate) return "El estudiante ya tiene una inscripcion activa en uno de los grupos.";
        return null;
    }, [
        selectedCredits,
        selectedGroupIds.length,
        selectedGroups,
        selectedStudent?.activeRegistration,
        selectedStudentId,
    ]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                studentData,
                registrationData,
                groupData,
                subjectData,
                enrollmentData,
                semesterData,
                curriculumData,
            ] = await Promise.all([
                studentService.getAllWithAuth(),
                registrationService.getActiveStudents(),
                groupService.getAllWithAuth(),
                subjectService.getAllWithAuth(),
                enrollmentService.getAllWithAuth(),
                semesterService.getAllWithAuth(),
                curriculumService.getAllWithAuth(),
            ]);

            setStudents(studentData);
            setRegistrations(registrationData);
            setGroups(groupData);
            setSubjects(subjectData);
            setEnrollments(enrollmentData);
            setSemesters(semesterData);
            setCurriculums(curriculumData);
            setSelectedStudentId((current) => current || (studentData[0]?.id ?? ""));
        } catch {
            setError("No fue posible cargar estudiantes, grupos o matriculas.");
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (groupId: string) => {
        setSelectedGroupIds((current) =>
            current.includes(groupId)
                ? current.filter((id) => id !== groupId)
                : [...current, groupId]
        );
    };

    const createEnrollments = async () => {
        setSubmitting(true);
        try {
            const created = await Promise.all(
                selectedGroups.map((row) =>
                    enrollmentService.createGroupEnrollment({
                        enrollment_date: new Date().toISOString(),
                        group_id: row.id,
                        status: "ACTIVE",
                        student_id: selectedStudentId,
                    })
                )
            );

            const updatedEnrollments = await enrollmentService.getAllWithAuth();
            setEnrollments(updatedEnrollments);
            setSelectedGroupIds([]);
            return created.filter(Boolean);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelEnrollment = async (enrollmentId: string) => {
        await enrollmentService.cancel(enrollmentId);
        const updatedEnrollments = await enrollmentService.getAllWithAuth();
        setEnrollments(updatedEnrollments);
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        activeSemester,
        cancelEnrollment,
        createEnrollments,
        enrollableStudents,
        error,
        existingEnrollmentRows,
        groupRows,
        hasOutOfPlanSelection,
        loading,
        maxCredits: MAX_CREDITS,
        search,
        selectedCredits,
        selectedGroupIds,
        selectedStudent,
        selectedStudentId,
        setSearch,
        setSelectedStudentId,
        submitting,
        toggleGroup,
        validationError,
    };
};
