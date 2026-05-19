import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type {
    StudentGradeContext,
} from "../models/interfaces/StudenGradeContext";

import type {
    StudentGradeSummaryRow,
} from "../models/interfaces/StudenGradeSummaryRow";

import { useAcademicData } from "./useAcademicData";
import { downloadGradeReportCsv } from "../utils/csvExporter";
import { buildSummaryRows, buildDetailRows, getGradeScore } from "../utils/gradeMappers";

export const useStudentGradeDetails = () => {
    // 1. Datos de origen (Abstraídos vía Inversión de Dependencias en submódulo)
    const { data, loading, error } = useAcademicData();
    
    const user = useSelector((state: RootState) => state.user.user);
    const currentStudentId = user?.role === "STUDENT" ? user.profile?.id : undefined;

    // 2. Estados exclusivos de UI (Selecciones de fila y filtro)
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedGradeId, setSelectedGradeId] = useState("");

    // 3. Procesamiento y formateo de datos para la tabla de resumen
    const gradeRows = useMemo(() => {
        if (!data) return [];
        return buildSummaryRows(
            data.grades,
            data.evaluations,
            data.rubrics,
            data.subjects,
            data.groups,
            data.teachers,
            currentStudentId
        );
    }, [data, currentStudentId]);

    // Asignaturas únicas deducidas de las filas de calificaciones mapeadas
    const availableSubjects = useMemo(() => {
        const subjectsMap = new Map<string, { id: string; name: string }>();
        
        gradeRows.forEach((row: StudentGradeSummaryRow) => {
            if (row.subjectId && !subjectsMap.has(row.subjectId)) {
                subjectsMap.set(row.subjectId, {
                    id: row.subjectId,
                    name: row.subjectName,
                });
            }
        });

        return Array.from(subjectsMap.values());
    }, [gradeRows]);

    const filteredGrades = useMemo(() => {
        if (!selectedSubjectId) return gradeRows;
        return gradeRows.filter(
            (row: StudentGradeSummaryRow) => row.subjectId === selectedSubjectId
        );
    }, [gradeRows, selectedSubjectId]);

    const selectedRow = useMemo(() => {
        return (
            filteredGrades.find(
                (row: StudentGradeSummaryRow) => row.id === selectedGradeId
            ) ?? filteredGrades[0]
        );
    }, [filteredGrades, selectedGradeId]);

    const selectedGrade = selectedRow?.grade;

    // 4. Procesamiento de Contextos Relacionales y Detalles
    const selectedContext = useMemo<StudentGradeContext>(() => {
        if (!data || !selectedGrade) return { grade: selectedGrade };

        const evaluation =
            data.evaluations.find((item) => item.id === selectedGrade.evaluation_id) ??
            data.evaluations.find((item) => item.rubric_id === selectedGrade.rubric_id);

        const rubric = data.rubrics.find((item) => item.id === selectedGrade.rubric_id);
        const subject = data.subjects.find((item) => item.id === evaluation?.subject_id);
        const group = data.groups.find((item) => item.id === evaluation?.group_id);
        const teacher = data.teachers.find((item) => item.id === group?.teacher_id);

        return { evaluation, grade: selectedGrade, group, rubric, subject, teacher };
    }, [data, selectedGrade]);

    const detailRows = useMemo(() => {
        if (!data) return [];
        return buildDetailRows(selectedGrade, data.criteria, data.scales);
    }, [data, selectedGrade]);

    // 5. Acción delegada (Cumple SRP: la lógica imperativa de I/O está fuera)
    const handleDownloadReport = () => {
        if (!selectedGrade) return;
        downloadGradeReportCsv({
            selectedGrade,
            selectedContext,
            detailRows,
            getGradeScore,
        });
    };

    // 6. Efectos secundarios encargados estrictamente de la sincronización de UI
    useEffect(() => {
        const firstSubject = availableSubjects[0];
        if (!selectedSubjectId && firstSubject) {
            setSelectedSubjectId(firstSubject.id);
        }
    }, [availableSubjects, selectedSubjectId]);

    useEffect(() => {
        if (filteredGrades[0] && !filteredGrades.some((item) => item.id === selectedGradeId)) {
            setSelectedGradeId(filteredGrades[0].id);
        }
    }, [filteredGrades, selectedGradeId]);

    return {
        availableSubjects,
        detailRows,
        downloadReport: handleDownloadReport,
        error,
        filteredGrades,
        gradeRows,
        loading,
        selectedContext,
        selectedGradeId,
        selectedSubjectId,
        setSelectedGradeId,
        setSelectedSubjectId,
    };
};