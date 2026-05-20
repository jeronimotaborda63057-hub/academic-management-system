/**
 * pages/study-plan/List.tsx — REFACTORIZADO
 *
 * SRP: esta página solo coordina UI. Toda la lógica fue movida a useStudyPlan.
 * OCP: los paneles (SubjectCatalog, PlanPanel, PlanDetail) son extensibles
 *      sin tocar esta página.
 */

import React, { useState } from "react";
import { DndContext } from "@dnd-kit/core";

import PageHeader from "../../components/ui/PageHeader";
import SubjectCatalog from "../../components/studyPlans/SubjectCatalog";
import PlanPanel from "../../components/studyPlans/PlanPanel";
import PlanDetail from "../../components/studyPlans/PlanDetail";
import { useStudyPlan } from "../../hooks/useStudyPlan";

type StudyPlanTab = "structure" | "drafts";

const TABS: { key: StudyPlanTab; label: string }[] = [
  { key: "structure", label: "Estructura del plan" },
  { key: "drafts",    label: "Borradores" },
];

const List: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudyPlanTab>("structure");

  const {
    careers,
    selectedCareer,
    setSelectedCareer,
    selectedYear,
    setSelectedYear,
    selectedSubjectId,
    setSelectedSubjectId,
    subjectSearch,
    setSubjectSearch,
    catalogItems,
    planPanelItems,
    planDetailData,
    allVersions,
    availableYears,
    handleDragEnd,
    handleRemove,
    handleNewVersion,
    handlePublish,
  } = useStudyPlan();

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <PageHeader
          title="Plan de estudios"
          subtitle="Define y versiona las asignaturas por semestre de cada carrera."
          breadcrumb={["Inicio", "Plan de estudios"]}
        />

        {/* ── Selectores ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Carrera
            </label>
            <select
              value={selectedCareer?.id ?? ""}
              onChange={(e) =>
                setSelectedCareer(careers.find((c) => c.id === e.target.value) ?? null)
              }
              className="h-10 px-3 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm outline-none focus:border-primary transition-colors min-w-[250px]"
            >
              <option value="">Selecciona una carrera</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {selectedCareer && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Versión
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

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-6 border-b border-stroke dark:border-strokedark mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Estructura ─────────────────────────────────────────────────── */}
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

        {/* ── Borradores ─────────────────────────────────────────────────── */}
        {activeTab === "drafts" && (
          <div className="rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-6">
            <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
              Borradores
            </h3>
            {!selectedCareer ? (
              <p className="text-sm text-gray-400">
                Selecciona una carrera para ver sus borradores.
              </p>
            ) : allVersions.filter((v) => !v.isPublished).length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay borradores para esta carrera.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {allVersions
                  .filter((v) => !v.isPublished)
                  .map((version) => (
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