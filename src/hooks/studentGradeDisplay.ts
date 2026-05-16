import type { Grade } from "../models/Grade";

export const formatGradeScore = (score: number) => score.toFixed(2);

export const formatGradeDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString("es-CO") : "-";

export const getGradeFinalScore = (grade?: Grade) =>
    grade?.final_score ?? grade?.note_final ?? grade?.nota_final ?? 0;
