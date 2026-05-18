import { api } from "../interceptors/authInterceptor";

import { rubricService } from "./rubricService";
import { subjectService } from "./subjectService";
import { evaluationService } from "./evaluationService";

import type { Rubric } from "../models/Rubric";
import type { Subject } from "../models/Subject";

class EvaluationRubricService {

    async getEvaluation(id: string) {
        return await evaluationService.getById(id);
    }

    async getPublishedRubrics(): Promise<Rubric[]> {
        const rubrics = await rubricService.getAll();

        return rubrics.filter(
            (rubric) => rubric.is_public === true,
        );
    }

    async getSubjects(): Promise<Subject[]> {
        return await subjectService.getAll();
    }

    async hasGrades(
        evaluationId: number,
    ): Promise<boolean> {

        const response = await api.get(
            `/evaluations/${evaluationId}/has-grades`,
        );

        return response.data.hasGrades;
    }

    async associate(
        evaluationId: number,
        rubricId: number,
        subjectId: number,
    ) {

        const response = await api.patch(
            `/evaluations/${evaluationId}`,
            {
                rubric_id: rubricId,
                subject_id: subjectId,
            },
        );

        return response.data;
    }
}

export const evaluationRubricService = new EvaluationRubricService();