import React, { useEffect, useState, useCallback } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Career } from "../../models/uml/Career";
import type { Subject } from "../../models/uml/Subject";
import type { Curriculum } from "../../models/uml/Curriculum";
import { careerService } from "../../services/careerService";
import { subjectService } from "../../services/subjectService";
import { curriculumService } from "../../services/curriculumService";
import { groupService } from "../../services/groupService";
import PageHeader from "../../components/ui/PageHeader";
import SubjectCatalog from "../../components/studyPlans/SubjectCatalog";
import type { CatalogItem } from "../../components/studyPlans/SubjectCatalog";
import PlanPanel from "../../components/studyPlans/PlanPanel";
import type { PlanPanelItem } from "../../components/studyPlans/PlanPanel";
import PlanDetail from "../../components/studyPlans/PlanDetail";
import type { PlanDetailData, PlanVersion } from "../../components/studyPlans/PlanDetail";
import Swal from "sweetalert2";

type StudyPlanTab = "structure" | "drafts";

const STUDY_PLAN_TABS: { key: StudyPlanTab; label: string }[] = [
    { key: "structure", label: "Estructura del plan" },
    { key: "drafts", label: "Borradores" },
];

const List: React.FC = () => {
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
    const [activeTab, setActiveTab] = useState<StudyPlanTab>("structure");

    // ─── Carga inicial ───────────────────────────────────────
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

    // ─── Carga planes al cambiar carrera ─────────────────────
    useEffect(() => {
        if (!selectedCareer) return;
        setSelectedYear(null);
        setPlanSubjects([]);
        setSubjectPlanMap({});
        loadPlans();
    }, [selectedCareer]);

    const loadPlans = useCallback(async () => {
        if (!selectedCareer) return;
        const all = await curriculumService.getAll();
        const filtered = all.filter((c) => c.career_id === selectedCareer.id);
        setPlanItems(filtered);
    }, [selectedCareer]);

    useEffect(() => {
        if (planItems.length === 0) return;

        const loadCounts = async () => {
            const counts: Record<number, number> = {};
            const yearsSeen = new Set<number>();

            for (const plan of planItems) {
                if (!plan.year || yearsSeen.has(plan.year)) continue;
                yearsSeen.add(plan.year);

                const plansOfYear = planItems.filter((p) => p.year === plan.year);
                let total = 0;

                for (const p of plansOfYear) {
                    const subs = await curriculumService.getSubjects(p.id!);
                    total += subs.length;
                }

                counts[plan.year] = total;
            }

            setYearSubjectCount(counts);
        };

        loadCounts();
    }, [planItems]);

    // ─── Carga asignaturas al cambiar año seleccionado ───────
    useEffect(() => {
        if (!selectedYear || !selectedCareer) return;
        loadPlanSubjects();
    }, [selectedYear]);

    const loadPlanSubjects = useCallback(async () => {
        if (!selectedYear || !selectedCareer) return;
        const plansOfYear = planItems.filter((p) => p.year === selectedYear);
        const allSubjects: Subject[] = [];
        const map: Record<string, string> = {};

        for (const plan of plansOfYear) {
            const subs = await curriculumService.getSubjects(plan.id!);
            subs.forEach((s) => {
                if (!allSubjects.find((existing) => existing.id === s.id)) {
                    allSubjects.push(s);
                    map[s.id!] = plan.id!;
                }
            });
        }

        setPlanSubjects(allSubjects);
        setSubjectPlanMap(map);
    }, [selectedYear, planItems, selectedCareer]);

    // ─── Drag & Drop ─────────────────────────────────────────
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
        const alreadyInPlan = planSubjects.some((s) => s.id === subjectId);
        if (alreadyInPlan) {
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
            const newPlanPayload: Omit<Curriculum, "id" | "created_at" | "updated_at"> = {
                career_id: selectedCareer.id,
                name: `Plan ${selectedYear}`,
                year: selectedYear,
                suggested_semester: parseInt(semester),
                is_published: false,
            };

            const newPlan = await curriculumService.create(newPlanPayload);

            if (!newPlan || !newPlan.id) {
                Swal.fire("Error", "No se pudo crear el plan.", "error");
                return;
            }

            targetPlan = newPlan;
            setPlanItems((prev) => [...prev, newPlan]);
        }

        const success = await curriculumService.addSubject(targetPlan.id!, subjectId);
        if (success) {
            const updatedPlans = [...planItems, targetPlan];
            const plansOfYear = updatedPlans.filter((p) => p.year === selectedYear);
            const allSubjects: Subject[] = [...planSubjects];
            const updatedMap = { ...subjectPlanMap };

            for (const plan of plansOfYear) {
                const subs = await curriculumService.getSubjects(plan.id!);
                subs.forEach((s) => {
                    if (!allSubjects.find((existing) => existing.id === s.id)) {
                        allSubjects.push(s);
                    }
                    updatedMap[s.id!] = plan.id!;
                });
            }

            setPlanSubjects(allSubjects);
            setSubjectPlanMap(updatedMap);
            Swal.fire("Agregada", "Asignatura vinculada al plan.", "success");
        } else {
            Swal.fire("Error", "No se pudo vincular la asignatura.", "error");
        }
    };

    // ─── Remover asignatura ──────────────────────────────────
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
        } catch (error) {
            console.error("Error verificando grupos:", error);
        }

        Swal.fire({
            title: "¿Desvincular asignatura?",
            text: `Se removerá ${subject?.name} del plan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, remover",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await curriculumService.removeSubject(planId, subjectId);
                if (success) {
                    Swal.fire("Removida", "Asignatura removida del plan.", "success");
                    await loadPlanSubjects();
                } else {
                    Swal.fire("Error", "No se pudo remover la asignatura.", "error");
                }
            }
        });
    };

    // ─── Nueva versión ───────────────────────────────────────
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
        const yearExists = planItems.some((p) => p.year === parsedYear);
        if (yearExists) {
            Swal.fire("Ya existe", `Ya hay un plan con el año ${year}.`, "warning");
            return;
        }

        const newVersion: Omit<Curriculum, "id" | "created_at" | "updated_at"> = {
            career_id: selectedCareer.id,
            name: `Plan ${parsedYear}`,
            year: parsedYear,
            suggested_semester: 1,
            is_published: false,
        };

        const createdPlan = await curriculumService.create(newVersion);

        if (!createdPlan?.id) {
            Swal.fire("Error", "No se pudo crear la versión del plan.", "error");
            return;
        }

        setPlanItems((prev) => [...prev, createdPlan]);
        setYearSubjectCount((prev) => ({
            ...prev,
            [parsedYear]: prev[parsedYear] ?? 0,
        }));
        setPlanSubjects([]);
        setSubjectPlanMap({});
        setSelectedYear(parsedYear);
        setActiveTab("structure");

        Swal.fire({
            title: `Versión ${year} lista`,
            text: "Arrastra asignaturas al plan para comenzar. Publícala cuando esté lista.",
            icon: "info",
            confirmButtonText: "Entendido",
        });
    };

    // ─── Publicar versión ────────────────────────────────────
    const handlePublish = async () => {
        if (!selectedCareer || !selectedYear) return;

        if (planSubjects.length === 0) {
            Swal.fire("No se puede publicar", "El plan debe tener al menos una asignatura.", "warning");
            return;
        }

        const plansToPublish = planItems.filter(
            (p) => p.year === selectedYear && !p.is_published
        );

        if (plansToPublish.length === 0) {
            Swal.fire("Ya publicado", "Esta versión ya está publicada.", "info");
            return;
        }

        Swal.fire({
            title: "¿Publicar esta versión?",
            text: `Se publicará el plan ${selectedYear} de ${selectedCareer.name}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, publicar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            await Promise.all(plansToPublish.map((p) => curriculumService.publish(p.id!)));
            Swal.fire("Publicado", "El plan ha sido publicado.", "success");
            await loadPlans();
        });
    };

    // ─── Datos procesados ────────────────────────────────────
    const filteredSubjects = subjects.filter((s) =>
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
                totalSubjects: yearSubjectCount[p.year] ?? 0, // ← usa el conteo real
                updatedAt: p.updated_at,
            });
        }
    });
    allVersions.sort((a, b) => b.year - a.year);

    const availableYears = allVersions.map((v) => v.year);

    const planDetailData: PlanDetailData | null = selectedCareer ? {
        careerName: selectedCareer.name ?? "",
        careerCode: selectedCareer.code ?? "",
        totalSubjects: planSubjects.length,
        totalCredits: planSubjects.reduce((sum, s) => sum + (s.credits ?? 0), 0),
        semesterCount: new Set(planItems.filter((p) => p.year === selectedYear).map((p) => p.suggested_semester)).size,
        lastUpdated: planItems.find((p) => p.year === selectedYear)?.updated_at,
        versions: allVersions,
    } : null;

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div>
                <PageHeader
                    title="Plan de estudios"
                    subtitle="Define y versiona las asignaturas por semestre de cada carrera."
                    breadcrumb={["Inicio", "Plan de estudios"]}
                />

                {/* Selectores */}
                <div className="mb-6 flex flex-wrap items-end gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Carrera
                        </label>
                        <select
                            value={selectedCareer?.id ?? ""}
                            onChange={(e) => {
                                const career = careers.find((c) => c.id === e.target.value) ?? null;
                                setSelectedCareer(career);
                            }}
                            className="h-10 px-3 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm outline-none focus:border-primary transition-colors min-w-[250px]"
                        >
                            <option value="">Selecciona una carrera</option>
                            {careers.map((career) => (
                                <option key={career.id} value={career.id}>
                                    {career.name} ({career.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCareer && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Versión activa (publicada)
                            </label>
                            <select
                                value={selectedYear ?? ""}
                                onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
                                className="h-10 px-3 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm outline-none focus:border-primary transition-colors"
                            >
                                <option value="">Selecciona una versión</option>
                                {availableYears.map((year) => {
                                    const isPublished = allVersions.find((v) => v.year === year)?.isPublished;
                                    return (
                                        <option key={year} value={year}>
                                            {year} {isPublished ? "✓ Publicado" : "— Borrador"}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {selectedCareer && (
                        <div className="flex items-center gap-2 mt-auto">
                            <button
                                onClick={handleNewVersion}
                                className="h-10 px-4 rounded-lg border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <span className="text-lg leading-none">+</span>
                                Nueva versión
                            </button>
                            <button
                                onClick={handlePublish}
                                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition"
                            >
                                Publicar versión
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-stroke dark:border-strokedark mb-6">
                    {STUDY_PLAN_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "structure" && (
                    <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-4">
                        <SubjectCatalog
                            items={catalogItems}
                            search={subjectSearch}
                            onSearchChange={setSubjectSearch}
                        />
                        <PlanPanel
                            items={planPanelItems}
                            selectedCareer={selectedCareer}
                            selectedPlanYear={selectedYear}
                            selectedSubjectId={selectedSubjectId}
                            onRemove={handleRemove}
                            onSelect={setSelectedSubjectId}
                        />
                        <PlanDetail
                            data={planDetailData}
                            selectedCareer={selectedCareer}
                        />
                    </div>
                )}

                {activeTab === "drafts" && (
                    <div className="rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-6">
                        <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
                            Borradores
                        </h3>
                        {!selectedCareer ? (
                            <p className="text-sm text-gray-400">Selecciona una carrera para ver sus borradores.</p>
                        ) : allVersions.filter((v) => !v.isPublished).length === 0 ? (
                            <p className="text-sm text-gray-400">No hay borradores para esta carrera.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {allVersions.filter((v) => !v.isPublished).map((version) => (
                                    <div
                                        key={version.year}
                                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-black dark:text-white">
                                                Versión {version.year}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                Borrador
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {version.updatedAt && (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(version.updatedAt).toLocaleDateString("es-CO")}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedYear(version.year);
                                                    setActiveTab("structure");
                                                }}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Ver plan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DndContext>
    );
};

export default List;