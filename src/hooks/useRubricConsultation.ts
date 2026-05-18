// useRubricConsultation.ts

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import type { Criteria } from "../models/Criteria";
import type { Evaluation } from "../models/Evaluation";
import type { Group } from "../models/Group";
import type { RootState } from "../store/store";
import type { Rubric } from "../models/Rubric";
import type { Scale } from "../models/Scale";
import type { Subject } from "../models/Subject";
import type { Teacher } from "../models/Teacher";

import { criteriaService } from "../services/criteriaService";
import { enrollmentService } from "../services/enrollmentService";
import { evaluationService } from "../services/evaluationService";
import { groupService } from "../services/groupService";
import { rubricService } from "../services/rubricService";
import { scaleService } from "../services/scaleService";
import { subjectService } from "../services/subjectService";
import { teacherService } from "../services/teacherService";

export interface RubricConsultationRecord {
    evaluation: Evaluation;
    rubric: Rubric;
    subject?: Subject;
    group?: Group;
    teacher?: Teacher;
    criteria: Criteria[];
    scales: Scale[];
}

const getProfileId = (profile?: { id?: string }) => profile?.id ?? "";

const normalizeId = (value?: string | String) =>
    String(value ?? "");

const buildRecords = (
    evaluations: Evaluation[],
    rubrics: Rubric[],
    criteria: Criteria[],
    scales: Scale[],
    groups: Group[],
    subjects: Subject[],
    teachers: Teacher[]
): RubricConsultationRecord[] => {
    const records: RubricConsultationRecord[] = [];

    evaluations.forEach((evaluation) => {
        const rubric = rubrics.find(
            (item) =>
                item.id === evaluation.rubric_id &&
                item.is_public
        );

        if (!rubric?.id) return;

        const rubricCriteria = criteria.filter(
            (criterion) =>
                normalizeId(criterion.rubric_id) === rubric.id
        );

        const criterionIds = rubricCriteria.map(
            (criterion) => criterion.id
        );

        const rubricScales = scales.filter(
            (scale) =>
                scale.criterion_id &&
                criterionIds.includes(scale.criterion_id)
        );

        const group = groups.find(
            (item) => item.id === evaluation.group_id
        );

        const subject = subjects.find(
            (item) =>
                item.id === (
                    evaluation.subject_id ??
                    group?.subject_id
                )
        );

        const teacher = teachers.find(
            (item) => item.id === group?.teacher_id
        );

        records.push({
            evaluation,
            rubric,
            subject,
            group,
            teacher,
            criteria: rubricCriteria,
            scales: rubricScales,
        });
    });

    return records;
};

const getVisibleEvaluations = (
    evaluations: Evaluation[],
    groups: Group[],
    role?: string,
    profileId?: string,
    activeGroupIds: string[] = []
) => {
    if (role === "STUDENT") {
        return evaluations.filter(
            (evaluation) =>
                evaluation.group_id &&
                activeGroupIds.includes(evaluation.group_id)
        );
    }

    if (role === "TEACHER") {
        const teacherGroupIds = groups
            .filter(
                (group) => group.teacher_id === profileId
            )
            .map((group) => group.id ?? "");

        return evaluations.filter(
            (evaluation) =>
                evaluation.group_id &&
                teacherGroupIds.includes(
                    evaluation.group_id
                )
        );
    }

    return evaluations;
};

export const useRubricConsultation = (
    evaluationId?: string
) => {
    const user = useSelector(
        (state: RootState) => state.user.user
    );

    const [records, setRecords] = useState<
        RubricConsultationRecord[]
    >([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(
        null
    );

    // ✅ NUEVO ESTADO
    const [evaluationWithoutRubric, setEvaluationWithoutRubric] =
        useState(false);

    const profileId = getProfileId(user?.profile);

    const selectedRecord = useMemo(() => {
        if (evaluationId) {
            return (
                records.find(
                    (record) =>
                        record.evaluation.id === evaluationId
                ) ?? null
            );
        }

        return records[0] ?? null;
    }, [evaluationId, records]);

    const loadRubrics = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ resetear
            setEvaluationWithoutRubric(false);

            const [
                evaluationData,
                rubricData,
                criteriaData,
                scaleData,
                groupData,
                subjectData,
                teacherData,
            ] = await Promise.all([
                evaluationService.getAllWithRubrics(),
                rubricService.getAllWithAuth(),
                criteriaService.getAll(),
                scaleService.getAll(),
                groupService.getAllWithAuth(),
                subjectService.getAll(),
                teacherService.getAll(),
            ]);

            // ✅ EXCEPCIÓN E1
            if (evaluationId) {
                const selectedEvaluation =
                    evaluationData.find(
                        (evaluation) =>
                            evaluation.id === evaluationId
                    );

                if (
                    selectedEvaluation &&
                    !selectedEvaluation.rubric_id
                ) {
                    setEvaluationWithoutRubric(true);
                    setRecords([]);
                    return;
                }
            }

            const activeEnrollments =
                user?.role === "STUDENT" && profileId
                    ? await enrollmentService.search({
                          student_id: profileId,
                          status: "ACTIVE",
                      })
                    : [];

            const activeGroupIds = activeEnrollments
                .map(
                    (enrollment) =>
                        enrollment.group_id ?? ""
                )
                .filter(Boolean);

            const visibleEvaluations =
                getVisibleEvaluations(
                    evaluationData,
                    groupData,
                    user?.role,
                    profileId,
                    activeGroupIds
                );

            const nextRecords = buildRecords(
                visibleEvaluations,
                rubricData,
                criteriaData,
                scaleData,
                groupData,
                subjectData,
                teacherData
            );

            setRecords(nextRecords);
        } catch {
            setError(
                "No fue posible cargar las rúbricas de tus evaluaciones."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRubrics();
    }, [user?.id, user?.role, profileId]);

    return {
        error,
        loading,
        records,
        selectedRecord,
        evaluationWithoutRubric,
        reload: loadRubrics,
    };
};