import { api } from "../interceptors/authInterceptor";
import type { Rubric } from "../models/Rubric";
import type { Subject } from "../models/Subject";

class EvaluationRubricService {

    // ─────────────────────────────────────────────
    // EVALUATIONS
    // ─────────────────────────────────────────────

    async getAllEvaluations(): Promise<any[]> {

        try {

            const response =
                await api.get("/evaluation/evaluations");

            return Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);

        } catch (error) {

            console.error(
                "Error al listar evaluaciones:",
                error
            );

            return [];
        }
    }

    async getEvaluation(id: string): Promise<any | null> {

        try {

            const response =
                await api.get(`/evaluation/evaluations/${id}`);

            return response.data?.data ||
                   response.data ||
                   null;

        } catch (error) {

            console.error(
                "Error al obtener evaluación:",
                error
            );

            return null;
        }
    }

    // ─────────────────────────────────────────────
    // SUBJECTS
    // ─────────────────────────────────────────────

    async getSubjects(): Promise<Subject[]> {

        try {

            const response =
                await api.get("/academic/subjects");

            return Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);

        } catch (error) {

            console.error(
                "Error al obtener asignaturas:",
                error
            );

            return [];
        }
    }

    // ─────────────────────────────────────────────
    // GROUPS
    // ─────────────────────────────────────────────

    async getGroups(): Promise<any[]> {

        try {

            const response =
                await api.get("/academic/groups");

            return Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);

        } catch (error) {

            console.error(
                "Error al obtener grupos:",
                error
            );

            return [];
        }
    }

    // ─────────────────────────────────────────────
    // RUBRICS
    // ─────────────────────────────────────────────

    async getPublishedRubrics(): Promise<Rubric[]> {

        try {

            const response =
                await api.get("/evaluation/rubrics");

            const rubrics = Array.isArray(response.data)
                ? response.data
                : (response.data?.data || []);

            return rubrics.filter((rubric: any) => {

                if (!rubric) return false;

                return (
                    rubric.is_public === true ||
                    rubric.is_public == 1 ||
                    String(rubric.is_public)
                        .toLowerCase() === "true"
                );
            });

        } catch (error) {

            console.error(
                "Error al obtener rúbricas:",
                error
            );

            return [];
        }
    }

    // ─────────────────────────────────────────────
    // CU-10
    // ─────────────────────────────────────────────

    async associate(
        evaluationId: string,
        subjectId: string,
        groupId: string,
        rubricId: string,
        evaluationName: string,
        evaluationDescription: string,
        evaluationWeight: number
    ) {

        const payload = {

            subject_id: subjectId,

            group_id: groupId,

            rubric_id: rubricId,

            name: evaluationName,

            description:
                evaluationDescription || "",

            weight: Number(evaluationWeight)
        };

        console.log(
            "Payload enviado:",
            payload
        );

        const response = await api.put(
            `/evaluation/evaluations/${evaluationId}`,
            payload
        );

        return response.data;
    }
}

export const evaluationRubricService =
    new EvaluationRubricService();