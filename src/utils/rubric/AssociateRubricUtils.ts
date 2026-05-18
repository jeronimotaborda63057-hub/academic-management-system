import type { EvaluationOption, GroupOption } from "../../models/rubric/AssociateRubricTypes"

export const resolveGroupId = (raw: GroupOption): string =>
    String(raw.id ?? raw.group_id ?? raw.id_group ?? "");

export const resolveSubjectId = (raw: GroupOption): string =>
    String(raw.subject_id ?? raw.id_subject ?? raw.subject?.id ?? "");

export const resolveEvaluationId = (ev: EvaluationOption): string =>
    String((ev as any).evaluation_id ?? (ev as any).id_evaluation ?? ev.id ?? "");

export const normalizeGroups = (data: unknown): GroupOption[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data))
        return (data as any).data;
    return [];
};

export const findGroupByEvaluation = (
    groups: GroupOption[],
    targetGroupId: string
): GroupOption | undefined =>
    groups.find((g) => String(resolveGroupId(g)) === String(targetGroupId));

export const findGroupBySubject = (
    groups: GroupOption[],
    subjectId: string
): GroupOption | undefined =>
    groups.find((g) => String(resolveSubjectId(g)) === String(subjectId));