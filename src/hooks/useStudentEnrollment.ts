import { useCallback, useEffect, useMemo, useState } from "react";

import type { Career } from "../models/uml/Career";
import type {
    AcademicRegistrationStatus,
    Registration,
} from "../models/uml/Registration";
import type { StudentProfile } from "../models/interfaces/StudentProfile";
import type { Student } from "../models/uml/Student";
import type { User } from "../models/uml/User";
import { careerService } from "../services/careerService";
import { registrationService } from "../services/registrationService";
import { studentService } from "../services/studentService";
import { userService } from "../services/userService";

export interface StudentEnrollmentErrors {
    academicStatus?: string;
    admissionPeriod?: string;
    careerId?: string;
    duplicate?: string;
    studentId?: string;
}

export interface StudentEnrollmentDraft {
    academicStatus: AcademicRegistrationStatus;
    admissionPeriod: string;
    careerId: string;
}

export interface StudentEnrollmentOption {
    activeRegistrations: Registration[];
    profile: StudentProfile;
    registrations: Registration[];
    user: User;
}

export const ACADEMIC_STATUS_OPTIONS: {
    description: string;
    label: string;
    value: AcademicRegistrationStatus;
}[] = [
        {
            value: "ACTIVE",
            label: "Activo",
            description: "Estudiante con matricula vigente y en condicion normal.",
        },
        {
            value: "WITHDRAWN",
            label: "Retirado",
            description: "Estudiante que se retira voluntariamente.",
        },
        {
            value: "SUSPENDED",
            label: "Suspendido",
            description: "Estudiante con matricula suspendida temporalmente.",
        },
        {
            value: "GRADUATED",
            label: "Egresado",
            description: "Estudiante que ha finalizado su plan de estudios.",
        },
    ];

const ADMISSION_PERIOD_PATTERN = /^\d{4}-(1|2)$/;
const DEFAULT_DRAFT: StudentEnrollmentDraft = {
    academicStatus: "ACTIVE",
    admissionPeriod: "",
    careerId: "",
};

const normalizeRole = (role: unknown): string => String(role ?? "").toUpperCase();

const normalizeBool = (value: unknown): boolean =>
    value === true || value === "true" || value === 1 || value === "1";

const isStudent = (user: User): boolean => normalizeRole(user.role) === "STUDENT";

const normalizeText = (value?: string): string =>
    (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const toReadableRegistrationError = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

    if (message === "student already has an active registration in this career") {
        return "El estudiante ya tiene una matricula activa en esta carrera.";
    }

    if (message === "student not found") {
        return "No se encontro el estudiante seleccionado.";
    }

    return message ?? "No se pudo registrar la matricula.";
};

export const isValidAdmissionPeriod = (period: string): boolean =>
    ADMISSION_PERIOD_PATTERN.test(period.trim());

export const isRegistrationActive = (registration?: Registration): boolean =>
    registration?.is_active === true || registration?.academic_status === "ACTIVE";

export const getAcademicStatusLabel = (status?: string): string =>
    ACADEMIC_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status ??
    "-";

export const getStudentProfile = (user: User): StudentProfile | undefined => {
    const profile = user.profile;
    if (!profile || !("first_name" in profile) || !("last_name" in profile)) {
        return undefined;
    }

    return profile as StudentProfile;
};

export const getStudentDisplayName = (user: User): string => {
    const profile = getStudentProfile(user);
    const fullName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.code || user.email;
};

export const getStudentProfileId = (user: User): string | undefined =>
    getStudentProfile(user)?.id;

const toStudentProfile = (student?: Student | StudentProfile): StudentProfile | undefined => {
    if (!student?.id) return undefined;

    return {
        id: student.id,
        user_id: student.user_id ?? "",
        first_name: student.first_name ?? "",
        last_name: student.last_name ?? "",
        identification: student.identification ?? "",
    };
};

const buildStudentUsers = (users: User[], profiles: Student[]): User[] => {
    const userStudents = users
        .filter(isStudent)
        .map((user) => {
            const currentProfile = getStudentProfile(user);
            const profile = toStudentProfile(
                profiles.find((student) => student.id === currentProfile?.id) ??
                profiles.find((student) => student.user_id === user.id) ??
                currentProfile
            );

            return {
                ...user,
                is_active: normalizeBool(user.is_active),
                profile,
            } as User;
        });

    const knownProfileIds = new Set(
        userStudents
            .map((user) => getStudentProfile(user)?.id)
            .filter((id): id is string => Boolean(id))
    );

    const profileOnlyStudents = profiles
        .filter((profile) => profile.id && !knownProfileIds.has(profile.id))
        .map((profile) => ({
            id: profile.user_id ?? profile.id!,
            email: "",
            code: profile.identification ?? profile.id!,
            role: "STUDENT" as const,
            is_active: true,
            profile: toStudentProfile(profile),
        }));

    return [...userStudents, ...profileOnlyStudents];
};

export const useStudentEnrollment = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [draft, setDraft] = useState<StudentEnrollmentDraft>(DEFAULT_DRAFT);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [usersData, careersData, registrationData, studentProfiles] = await Promise.all([
                userService.getAll(),
                careerService.getAll(),
                registrationService.getAll(),
                studentService.getAllWithAuth(),
            ]);

            setStudents(buildStudentUsers(usersData, studentProfiles));
            setCareers(careersData.filter((career) => career.is_active));
            setRegistrations(registrationData);
        } catch {
            setError("No fue posible cargar estudiantes, carreras o matriculas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const careerById = useMemo(() => {
        return new Map(careers.map((career) => [career.id, career]));
    }, [careers]);

    const studentOptions = useMemo<StudentEnrollmentOption[]>(() => {
        return students
            .map((user) => {
                const profile = getStudentProfile(user);
                if (!profile) return null;

                const studentRegistrations: Registration[] = registrations
                    .filter((registration) => registration.student_id === profile.id)
                    .map((registration): Registration => ({
                        ...registration,
                        career: careerById.get(registration.career_id ?? ""),
                    }));

                return {
                    activeRegistrations: studentRegistrations.filter(isRegistrationActive),
                    profile,
                    registrations: studentRegistrations,
                    user,
                };
            })
            .filter((option): option is StudentEnrollmentOption => option !== null);
    }, [careerById, registrations, students]);

    const filteredStudents = useMemo(() => {
        const query = normalizeText(search);
        if (!query) return studentOptions;

        return studentOptions.filter(({ profile, user }) => {
            const searchable = normalizeText(
                [
                    profile.first_name,
                    profile.last_name,
                    profile.identification,
                    user.code,
                    user.email,
                ].join(" ")
            );

            return searchable.includes(query);
        });
    }, [search, studentOptions]);

    const selectedStudent = useMemo(
        () => studentOptions.find(({ user }) => user.id === selectedStudentId) ?? null,
        [selectedStudentId, studentOptions]
    );

    const selectedCareer = useMemo(
        () => careers.find((career) => career.id === draft.careerId) ?? null,
        [careers, draft.careerId]
    );

    const activeDuplicate = useMemo(() => {
        if (!selectedStudent || !draft.careerId) return undefined;

        return selectedStudent.registrations.find(
            (registration) =>
                registration.career_id === draft.careerId &&
                isRegistrationActive(registration)
        );
    }, [draft.careerId, selectedStudent]);

    const setSelectedCareerId = (careerId: string) => {
        setDraft((current) => ({ ...current, careerId }));
    };

    const setAdmissionPeriod = (admissionPeriod: string) => {
        setDraft((current) => ({ ...current, admissionPeriod }));
    };

    const setAcademicStatus = (academicStatus: AcademicRegistrationStatus) => {
        setDraft((current) => ({ ...current, academicStatus }));
    };

    const selectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
        setDraft(DEFAULT_DRAFT);
    };

    const validateDraft = (includeDuplicate = true): StudentEnrollmentErrors => {
        const errors: StudentEnrollmentErrors = {};

        if (!selectedStudent) {
            errors.studentId = "Selecciona un estudiante.";
        }

        if (!draft.careerId) {
            errors.careerId = "Selecciona una carrera.";
        }

        if (!draft.admissionPeriod.trim()) {
            errors.admissionPeriod = "Ingresa el periodo de ingreso.";
        } else if (!isValidAdmissionPeriod(draft.admissionPeriod)) {
            errors.admissionPeriod =
                "El periodo de ingreso debe tener el formato AAAA-N (ej. 2024-1).";
        }

        if (!draft.academicStatus) {
            errors.academicStatus = "Selecciona un estado academico.";
        }

        if (includeDuplicate && activeDuplicate) {
            errors.duplicate = "El estudiante ya tiene una matricula activa en esta carrera.";
        }

        return errors;
    };

    const createRegistration = async (): Promise<Registration | null> => {
        const validation = validateDraft(true);
        if (Object.keys(validation).length > 0 || !selectedStudent) return null;

        setSubmitting(true);
        try {
            const registration = await registrationService.createCareerRegistration({
                academic_status: draft.academicStatus,
                admission_period: draft.admissionPeriod.trim(),
                career_id: draft.careerId,
                is_active: draft.academicStatus === "ACTIVE",
                student_id: selectedStudent.profile.id,
            });

            await loadData();
            return registration;
        } catch (submitError) {
            throw new Error(toReadableRegistrationError(submitError));
        } finally {
            setSubmitting(false);
        }
    };

    const updateRegistrationStatus = async (
        registrationId: string,
        status: AcademicRegistrationStatus
    ): Promise<Registration> => {
        setSubmitting(true);
        try {
            const updatedRegistration = await registrationService.updateAcademicStatus(
                registrationId,
                status
            );

            await loadData();
            return updatedRegistration;
        } catch (submitError) {
            throw new Error(toReadableRegistrationError(submitError));
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedStudentId("");
        setDraft(DEFAULT_DRAFT);
        setSearch("");
    };

    const canSubmit =
        Boolean(selectedStudent && draft.careerId && draft.admissionPeriod && draft.academicStatus) &&
        !submitting;

    return {
        activeDuplicate,
        canSubmit,
        careers,
        createRegistration,
        draft,
        error,
        filteredStudents,
        getAcademicStatusLabel,
        loading,
        registrations,
        resetForm,
        search,
        selectStudent,
        selectedCareer,
        selectedStudent,
        selectedStudentId,
        setAcademicStatus,
        setAdmissionPeriod,
        setSearch,
        setSelectedCareerId,
        setSelectedStudentId: selectStudent,
        students,
        submitting,
        updateRegistrationStatus,
        validateDraft,
    };
};
