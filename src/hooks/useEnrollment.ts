import { useEffect, useState } from "react";

import type { Enrollment } from "../models/Enrollment";

import { enrollmentService } from "../services/enrollmentService";

export const useEnrollments = () => {

    const [enrollments, setEnrollments] =
        useState<Enrollment[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const loadEnrollments = async () => {

        try {

            setLoading(true);

            const data =
                await enrollmentService.getAll();

            setEnrollments(data);

        } catch (err) {

            setError(
                "No fue posible cargar matrículas"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollments();
    }, []);

    return {
        enrollments,
        loading,
        error,
        reload: loadEnrollments,
    };
};