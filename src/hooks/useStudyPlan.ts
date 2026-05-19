/**
 * useStudyPlan — SRP
 *
 * Extrae toda la lógica de negocio de pages/study-plan/List.tsx.
 * La página queda como coordinador puro de UI; este hook maneja:
 *   - Carga de carreras, asignaturas y planes
 *   - Conteo de asignaturas por año
 *   - Drag & Drop (agregar asignatura al plan)
 *   - Remover asignatura
 *   - Crear nueva versión
 *   - Publicar versión
 *   - Datos derivados para los tres paneles (SubjectCatalog, PlanPanel, PlanDetail)
 */

import { useCallback, useEffect, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import Swal from "sweetalert2";

import type { Career } from "../models/uml/Career";
import type { Subject } from "../models/uml/Subject";
import type { Curriculum } from "../models/uml/Curriculum";
import type { CatalogItem } from "../components/studyPlans/SubjectCatalog";
import type { PlanPanelItem } from "../components/studyPlans/PlanPanel";
import type { PlanDetailData, PlanVersion } from "../components/studyPlans/PlanDetail";

import { careerService } from "../services/careerService";
import { subjectService } from "../services/subjectService";
import { curriculumService } from "../services/curriculumService";
import { groupService } from "../services/groupService";

export function useStudyPlan() {
  // ─── Estado ────────────────────────────────────────────────────────────────
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [planItems, setPlanItems] = useState<Curriculum[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [planSubjects, setPlanSubjects] = useState<Subject[]>([]);
  const [subjectPlanMap, setSubjectPlanMap] = useState<Record<string, string>>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [yearSubjectCount, setYearSubjectCount] = useState<Record<number, number>>({});

  // ─── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const [careersData, subjectsData] = await Promise.all([
        careerService.getAll(),
        subjectService.getAll(),
      ]);
      setCareers(careersData);
      setSubjects(subjectsData);
    };
    load();
  }, []);

  // ─── Carga planes al cambiar carrera ──────────────────────────────────────
  useEffect(() => {
    if (!selectedCareer) return;
    setSelectedYear(null);
    setPlanSubjects([]);
    setSubjectPlanMap({});
    loadPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCareer]);

  const loadPlans = useCallback(async () => {
    if (!selectedCareer) return;
    const all = await curriculumService.getAll();
    setPlanItems(all.filter((c) => c.career_id === selectedCareer.id));
  }, [selectedCareer]);

  // ─── Conteo asignaturas por año ───────────────────────────────────────────
  useEffect(() => {
    if (planItems.length === 0) return;
    const loadCounts = async () => {
      const counts: Record<number, number> = {};
      const yearsSeen = new Set<number>();
      for (const plan of planItems) {
        if (!plan.year || yearsSeen.has(plan.year)) continue;
        yearsSeen.add(plan.year);
        let total = 0;
        for (const p of planItems.filter((pl) => pl.year === plan.year)) {
          const subs = await curriculumService.getSubjects(p.id!);
          total += subs.length;
        }
        counts[plan.year] = total;
      }
      setYearSubjectCount(counts);
    };
    loadCounts();
  }, [planItems]);

  // ─── Carga asignaturas del año seleccionado ───────────────────────────────
  const loadPlanSubjects = useCallback(async () => {
    if (!selectedYear || !selectedCareer) return;
    const plansOfYear = planItems.filter((p) => p.year === selectedYear);
    const allSubjects: Subject[] = [];
    const map: Record<string, string> = {};
    for (const plan of plansOfYear) {
      const subs = await curriculumService.getSubjects(plan.id!);
      subs.forEach((s) => {
        if (!allSubjects.find((e) => e.id === s.id)) {
          allSubjects.push(s);
          map[s.id!] = plan.id!;
        }
      });
    }
    setPlanSubjects(allSubjects);
    setSubjectPlanMap(map);
  }, [selectedYear, planItems, selectedCareer]);

  useEffect(() => {
    if (!selectedYear || !selectedCareer) return;
    loadPlanSubjects();
  }, [selectedYear, loadPlanSubjects, selectedCareer]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== "plan-panel") return;

    if (!selectedCareer) {
      Swal.fire("Selecciona una carrera", "Debes seleccionar una carrera primero.", "warning");
      return;
    }
    if (!selectedYear) {
      Swal.fire("Selecciona una versión", "Debes seleccionar o crear una versión del plan primero.", "warning");
      return;
    }

    const subjectId = active.id as string;
    if (planSubjects.some((s) => s.id === subjectId)) {
      Swal.fire("Ya existe", "Esta asignatura ya está en el plan.", "info");
      return;
    }

    const { value: semester } = await Swal.fire({
      title: "Semestre sugerido",
      input: "number",
      inputLabel: "¿En qué semestre se cursa esta asignatura?",
      inputAttributes: { min: "1", max: "10" },
      showCancelButton: true,
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
    });
    if (!semester) return;

    let targetPlan = planItems.find(
      (p) => p.year === selectedYear && p.suggested_semester === parseInt(semester)
    );

    if (!targetPlan) {
      const newPlan = await curriculumService.create({
        career_id: selectedCareer.id,
        name: `Plan ${selectedYear}`,
        year: selectedYear,
        suggested_semester: parseInt(semester),
        is_published: false,
      } as Omit<Curriculum, "id" | "created_at" | "updated_at">);

      if (!newPlan?.id) {
        Swal.fire("Error", "No se pudo crear el plan.", "error");
        return;
      }
      targetPlan = newPlan;
      setPlanItems((prev) => [...prev, newPlan]);
    }

    const success = await curriculumService.addSubject(targetPlan.id!, subjectId);
    if (success) {
      await loadPlanSubjects();
      Swal.fire("Agregada", "Asignatura vinculada al plan.", "success");
    } else {
      Swal.fire("Error", "No se pudo vincular la asignatura.", "error");
    }
  };

  // ─── Remover asignatura ───────────────────────────────────────────────────
  const handleRemove = async (planId: string, subjectId: string) => {
    const subject = planSubjects.find((s) => s.id === subjectId);
    try {
      const groups = await groupService.search({ subject_id: subjectId });
      if (groups.length > 0) {
        Swal.fire({
          title: "No se puede remover",
          html: `<b>${subject?.name}</b> tiene <b>${groups.length}</b> grupo(s) activo(s).<br/>Finaliza los grupos antes de removerla del plan.`,
          icon: "error",
          confirmButtonText: "Entendido",
        });
        return;
      }
    } catch (e) {
      console.error("Error verificando grupos:", e);
    }

    const result = await Swal.fire({
      title: "¿Desvincular asignatura?",
      text: `Se removerá ${subject?.name} del plan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      const success = await curriculumService.removeSubject(planId, subjectId);
      if (success) {
        Swal.fire("Removida", "Asignatura removida del plan.", "success");
        await loadPlanSubjects();
      } else {
        Swal.fire("Error", "No se pudo remover la asignatura.", "error");
      }
    }
  };

  // ─── Nueva versión ────────────────────────────────────────────────────────
  const handleNewVersion = async () => {
    if (!selectedCareer) return;
    const { value: year } = await Swal.fire({
      title: "Nueva versión del plan",
      input: "number",
      inputLabel: "Año de la nueva versión",
      inputValue: new Date().getFullYear(),
      inputAttributes: { min: "2020", max: "2099" },
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
    });
    if (!year) return;

    const parsedYear = parseInt(year);
    if (planItems.some((p) => p.year === parsedYear)) {
      Swal.fire("Ya existe", `Ya hay un plan con el año ${year}.`, "warning");
      return;
    }

    const created = await curriculumService.create({
      career_id: selectedCareer.id,
      name: `Plan ${parsedYear}`,
      year: parsedYear,
      suggested_semester: 1,
      is_published: false,
    } as Omit<Curriculum, "id" | "created_at" | "updated_at">);

    if (!created?.id) {
      Swal.fire("Error", "No se pudo crear la versión del plan.", "error");
      return;
    }

    setPlanItems((prev) => [...prev, created]);
    setYearSubjectCount((prev) => ({ ...prev, [parsedYear]: prev[parsedYear] ?? 0 }));
    setPlanSubjects([]);
    setSubjectPlanMap({});
    setSelectedYear(parsedYear);

    Swal.fire({
      title: `Versión ${year} lista`,
      text: "Arrastra asignaturas al plan para comenzar. Publícala cuando esté lista.",
      icon: "info",
      confirmButtonText: "Entendido",
    });
  };

  // ─── Publicar versión ─────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!selectedCareer || !selectedYear) return;
    if (planSubjects.length === 0) {
      Swal.fire("No se puede publicar", "El plan debe tener al menos una asignatura.", "warning");
      return;
    }

    const toPublish = planItems.filter((p) => p.year === selectedYear && !p.is_published);
    if (toPublish.length === 0) {
      Swal.fire("Ya publicado", "Esta versión ya está publicada.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "¿Publicar esta versión?",
      text: `Se publicará el plan ${selectedYear} de ${selectedCareer.name}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, publicar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;
    await Promise.all(toPublish.map((p) => curriculumService.publish(p.id!)));
    Swal.fire("Publicado", "El plan ha sido publicado.", "success");
    await loadPlans();
  };

  // ─── Datos derivados para los paneles ────────────────────────────────────
  const filteredSubjects = subjects.filter(
    (s) =>
      s.name?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code?.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const planSubjectIds = new Set(planSubjects.map((s) => s.id));

  const catalogItems: CatalogItem[] = filteredSubjects.map((s) => ({
    id: s.id!,
    code: s.code!,
    name: s.name!,
    credits: s.credits!,
    isInPlan: planSubjectIds.has(s.id),
  }));

  const planPanelItems: PlanPanelItem[] = planSubjects.map((s) => {
    const planId = subjectPlanMap[s.id!];
    const plan = planItems.find((p) => p.id === planId);
    return {
      planId: planId ?? "",
      subjectId: s.id!,
      subjectCode: s.code ?? "—",
      subjectName: s.name ?? "Sin nombre",
      credits: s.credits ?? 0,
      suggestedSemester: plan?.suggested_semester ?? 1,
    };
  });

  const yearsSeen = new Set<number>();
  const allVersions: PlanVersion[] = [];
  planItems.forEach((p) => {
    if (p.year && !yearsSeen.has(p.year)) {
      yearsSeen.add(p.year);
      const itemsOfYear = planItems.filter((i) => i.year === p.year);
      allVersions.push({
        year: p.year,
        isPublished: itemsOfYear.some((i) => i.is_published),
        totalSubjects: yearSubjectCount[p.year] ?? 0,
        updatedAt: p.updated_at,
      });
    }
  });
  allVersions.sort((a, b) => b.year - a.year);

  const planDetailData: PlanDetailData | null = selectedCareer
    ? {
        careerName: selectedCareer.name ?? "",
        careerCode: selectedCareer.code ?? "",
        totalSubjects: planSubjects.length,
        totalCredits: planSubjects.reduce((sum, s) => sum + (s.credits ?? 0), 0),
        semesterCount: new Set(
          planItems.filter((p) => p.year === selectedYear).map((p) => p.suggested_semester)
        ).size,
        lastUpdated: planItems.find((p) => p.year === selectedYear)?.updated_at,
        versions: allVersions,
      }
    : null;

  return {
    // Estado de selección
    careers,
    selectedCareer,
    setSelectedCareer,
    selectedYear,
    setSelectedYear,
    selectedSubjectId,
    setSelectedSubjectId,
    subjectSearch,
    setSubjectSearch,
    // Datos para paneles
    catalogItems,
    planPanelItems,
    planDetailData,
    allVersions,
    availableYears: allVersions.map((v) => v.year),
    // Acciones
    handleDragEnd,
    handleRemove,
    handleNewVersion,
    handlePublish,
  };
}