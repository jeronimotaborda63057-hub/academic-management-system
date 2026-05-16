import { useEffect, useMemo, useState } from "react";

import type { Career } from "../models/Career";
import type { Registration } from "../models/Registration";
import type { StudentProfile } from "../models/StudentProfile";
import type { User } from "../models/User";
import { careerService } from "../services/careerService";
import { registrationService } from "../services/registrationService";
import { userService } from "../services/userService";

const isStudent = (user: User): boolean => user.role.toLowerCase() === "student";

const getStudentProfile = (user: User): StudentProfile | undefined => {
    const profile = user.profile;
    if (!profile || !("first_name" in profile) || !("last_name" in profile)) return undefined;
    return profile as StudentProfile;
};

export const getStudentDisplayName = (user: User): string => {
    const profile = getStudentProfile(user);
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
    return fullName || user.code || user.email;
};

export const getStudentProfileId = (user: User): string | undefined =>
    getStudentProfile(user)?.id;

export const useStudentEnrollment = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedCareerId, setSelectedCareerId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [usersData, careersData] = await Promise.all([
                    userService.getAll(),
                    careerService.getAll(),
                ]);

                setStudents(usersData.filter(isStudent));
                setCareers(careersData);
            } catch {
                setError("No fue posible cargar estudiantes o carreras.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === selectedStudentId),
        [selectedStudentId, students]
    );

    const canSubmit = Boolean(selectedStudent && selectedCareerId && !submitting);

    const submitEnrollment = async (): Promise<Registration | null> => {
        if (!selectedStudent || !selectedCareerId) return null;

        const studentProfileId = getStudentProfileId(selectedStudent);
        if (!studentProfileId) {
            throw new Error("El usuario seleccionado no tiene perfil de estudiante.");
        }

        setSubmitting(true);
        try {
            const registration = await registrationService.create({
                academic_status: "ACTIVE",
                admission_period: new Date().getFullYear().toString(),
                career_id: selectedCareerId,
                is_active: true,
                student_id: studentProfileId,
            });

            if (registration) {
                setSelectedStudentId("");
                setSelectedCareerId("");
            }

            return registration;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        canSubmit,
        careers,
        error,
        loading,
        selectedCareerId,
        selectedStudentId,
        setSelectedCareerId,
        setSelectedStudentId,
        students,
        submitting,
        submitEnrollment,
    };
};
