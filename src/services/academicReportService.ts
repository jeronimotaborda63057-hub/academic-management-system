import { criteriaService } from "./criteriaService";
import { evaluationService } from "./evaluationService";
import { gradeService } from "./gradeService";
import { groupService } from "./groupService";
import { rubricService } from "./rubricService";
import { scaleService } from "./scaleService";
import { subjectService } from "./subjectService";
import { teacherService } from "./teacherService";

export const academicReportService = {
    async fetchCompleteAcademicData() {
        const [
            grades,
            evaluations,
            rubrics,
            criteria,
            scales,
            groups,
            subjects,
            teachers,
        ] = await Promise.all([
            gradeService.getAllWithDetails(),
            evaluationService.getAllWithRubrics(),
            rubricService.getAllWithAuth(),
            criteriaService.getAllWithAuth(),
            scaleService.getAllWithAuth(),
            groupService.getAllWithAuth(),
            subjectService.getAllWithAuth(),
            teacherService.getAllWithAuth(),
        ]);

        return { grades, evaluations, rubrics, criteria, scales, groups, subjects, teachers };
    }
};

// Definimos un tipo para la respuesta, facilitando la inversión de dependencias
export type AcademicDataPayload = Awaited<ReturnType<typeof academicReportService.fetchCompleteAcademicData>>;