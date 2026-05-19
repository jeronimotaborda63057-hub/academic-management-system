import type { Evaluation } from '../uml/Evaluation';
import type { Group } from '../uml/Group';

// Detalle de calificación por evaluación para un estudiante
export interface StudentEvalGrade {
    evaluation_id: string;
    evaluation_name: string;
    weight: number;          // Peso de la evaluación en porcentaje (ej: 30)
    raw_score: number;       // Nota cruda sobre 100
    weighted_score: number;  // Nota ponderada = raw_score * (weight/100)
}

// Fila del consolidado: un estudiante con todas sus notas de evaluaciones
export interface StudentFinalGradeRow {
    registration_id: string;
    inscription_code: string; // Ej: INS-2024-00123
    student_id: string;
    student_name: string;
    student_identification: string;
    final_grade: number;         // Suma ponderada de todas las evaluaciones
    is_complete: boolean;        // Todas las evaluaciones tienen nota
    observations?: string;       // Nota.observaciones cuando is_complete = false
    grades: StudentEvalGrade[];  // Detalle por evaluación
}

// Resumen estadístico del grupo (panel derecho del mockup)
export interface GroupSummary {
    students_with_complete_grade: number;
    students_with_partial_grade: number;
    total_students: number;
    group_average: number;
    highest_grade: number;
    lowest_grade: number;
}

// Estructura completa del consolidado devuelta por el backend
export interface FinalGradeConsolidated {
    group: Group;
    evaluations: Evaluation[];   // Lista de evaluaciones del grupo
    rows: StudentFinalGradeRow[]; // Una fila por inscripción activa
    summary: GroupSummary;
    semester_is_active: boolean; // Para validar excepción E2
    is_confirmed: boolean;       // Si ya fue confirmado oficialmente
    total_weight: number;        // Suma de pesos = 100%
}