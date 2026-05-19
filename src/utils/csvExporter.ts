import type { StudentGradeContext } from "../models/StudenGradeContext";
import type { StudentGradeDetailRow } from "../models/StudentGradeDetailRow";
import type { Grade } from "../models/Grade";

interface ExportReportArgs {
    selectedGrade: Grade;
    selectedContext: StudentGradeContext;
    detailRows: StudentGradeDetailRow[];
    getGradeScore: (grade: Grade) => number;
}

export const downloadGradeReportCsv = ({
    selectedGrade,
    selectedContext,
    detailRows,
    getGradeScore,
}: ExportReportArgs): void => {
    const header = ["criterio", "peso", "nivel", "puntaje", "comentario"];

    const body = detailRows.map((row) => [
        row.criterion?.name ?? "",
        String(row.criterion?.weight ?? 0),
        row.scale?.name ?? "",
        row.score.toFixed(2),
        row.comment ?? "",
    ]);

    const summary = [
        ["asignatura", selectedContext.subject?.name ?? ""],
        ["evaluacion", selectedContext.evaluation?.name ?? ""],
        ["rubrica", selectedContext.rubric?.title ?? ""],
        ["nota_final", getGradeScore(selectedGrade).toFixed(2)],
        ["observaciones", selectedGrade.observations ?? ""],
    ];

    const csv = [...summary, [], header, ...body]
        .map((line) =>
            line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reporte-${selectedContext.evaluation?.name ?? "desempeno"}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
};