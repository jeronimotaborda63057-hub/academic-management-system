import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Evaluation } from "../models/Evaluation";
import type { Rubric } from "../models/Rubric";
import type { Subject } from "../models/Subject";

import { evaluationService } from "../services/evaluationService";
import { rubricService } from "../services/rubricService";
import { subjectService } from "../services/subjectService";

// IMPORTANTE:
// Ajusta el import según tu proyecto.
// Puede ser:
// gradeService
// qualificationService
// scoreService
import { gradeService } from "../services/gradeService";

interface UseAssociateRubricProps {
  evaluationId: string;
}

export const useAssociateRubric = ({
  evaluationId,
}: UseAssociateRubricProps) => {

  // Loading principal
  const [loading, setLoading] =
    useState<boolean>(true);

  // Evaluación actual
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  // Información auxiliar
  const [rubrics, setRubrics] =
    useState<Rubric[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  // Selecciones
  const [selectedRubric, setSelectedRubric] =
    useState<Rubric | null>(null);

  const [selectedSubject, setSelectedSubject] =
    useState<Subject | null>(null);

  // Estado para validar si existen notas
  const [hasGrades, setHasGrades] =
    useState<boolean>(false);

  /**
   * Carga inicial de información.
   */
  const loadInitialData = useCallback(async () => {

    try {

      setLoading(true);

      // Requests paralelos
      const [
        evaluationResponse,
        rubricResponse,
        subjectResponse,
        gradesResponse
      ] = await Promise.all([
        evaluationService.getById(evaluationId),
        rubricService.getAll(),
        subjectService.getAll(),
        gradeService.getByEvaluationId(
          evaluationId
        )
      ]);

      // Guardar evaluación
      setEvaluation(evaluationResponse);

      // Guardar rúbricas
      setRubrics(rubricResponse || []);

      // Guardar asignaturas
      setSubjects(subjectResponse || []);

      // Validar si existen notas
      setHasGrades(
        (gradesResponse?.length || 0) > 0
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Error cargando información"
      );

    } finally {

      setLoading(false);
    }

  }, [evaluationId]);

  /**
   * Ejecutar carga inicial.
   */
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Solo rúbricas públicas.
   */
  const publishedRubrics = useMemo(() => {

    return rubrics.filter(
      rubric => rubric.is_public
    );

  }, [rubrics]);

  /**
   * Bloquea asociación si:
   * - ya existe rúbrica
   * - y existen notas
   */
  const isAssociationBlocked = useMemo(() => {

    return !!evaluation?.rubric_id &&
      hasGrades;

  }, [evaluation, hasGrades]);

  /**
   * Permite cambio si:
   * - no tiene rúbrica
   * - o no existen notas
   */
  const canChangeRubric = useMemo(() => {

    if (!evaluation?.rubric_id) {
      return true;
    }

    return !hasGrades;

  }, [evaluation, hasGrades]);

  /**
   * Confirmar asociación.
   */
  const associateRubric = async () => {

    // Validación evaluación
    if (!evaluation) {

      toast.error(
        "No existe evaluación"
      );

      return false;
    }

    // Validación rúbrica
    if (!selectedRubric) {

      toast.error(
        "Debes seleccionar una rúbrica"
      );

      return false;
    }

    // Validación asignatura
    if (!selectedSubject) {

      toast.error(
        "Debes seleccionar una asignatura"
      );

      return false;
    }

    // Validación bloqueo
    if (isAssociationBlocked) {

      toast.error(
        "No es posible cambiar la rúbrica porque ya existen notas"
      );

      return false;
    }

    // Request backend
    const response =
      await evaluationService.associateRubric(
        evaluation.id!,
        selectedRubric.id!,
        selectedSubject.id!
      );

    // Error backend
    if (!response) {

      toast.error(
        "Error asociando rúbrica"
      );

      return false;
    }

    toast.success(
      "Rúbrica asociada correctamente"
    );

    // Refrescar información
    await loadInitialData();

    return true;
  };

  return {

    // Estados
    loading,
    evaluation,

    rubrics,
    subjects,
    publishedRubrics,

    selectedRubric,
    selectedSubject,

    hasGrades,
    canChangeRubric,
    isAssociationBlocked,

    // Setters
    setSelectedRubric,
    setSelectedSubject,

    // Actions
    associateRubric,
  };
};