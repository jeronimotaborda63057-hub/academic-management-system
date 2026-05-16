import { useEffect, useMemo, useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import Swal from "sweetalert2";

import type { Criteria } from "../../models/Criteria";
import type { Rubric } from "../../models/Rubric";

import { rubricService } from "../../services/rubricService";
import { criteriaService } from "../../services/criteriaService";

import { useScaleDefinition } from "../../hooks/useScaleDefinition";

import PageHeader from "../../components/ui/PageHeader";

import { CriteriaSidebar } from "../../components/scales/CriteriaSidebar";
import { ScaleSummaryCard } from "../../components/scales/ScaleSummaryCard";

import FormField from "../../components/ui/FormField";
import { ScaleLevelsTableContainer } from "../../components/scales/ScaleLevelsTableContainer";

// ─────────────────────────────────────────────────────────────
//  Sub-componente: RubricEditPanel
//
//  SRP  → solo maneja el formulario de edición de la rúbrica.
//  OCP  → nuevos campos se agregan aquí sin tocar la página.
//  ISP  → recibe solo lo que necesita.
//  DIP  → no llama directamente al servicio; delega via onSave.
// ─────────────────────────────────────────────────────────────

interface RubricEditPanelProps {
    rubric: Rubric;
    saving: boolean;
    onSave: (patch: Partial<Rubric>) => Promise<void>;
    onCancel: () => void;
}

const RubricEditPanel = ({
    rubric,
    saving,
    onSave,
    onCancel,
}: RubricEditPanelProps) => {

    const [values, setValues] = useState({
        title: rubric.title ?? "",
        description: rubric.description ?? "",
        is_public: rubric.is_public ?? false,
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox"
            ? target.checked
            : target.value;

        setValues((prev) => ({ ...prev, [target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(values);
    };

    return (

        <form
            onSubmit={handleSubmit}
            className="
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                flex flex-col
                gap-4
            "
        >

            {/* ===== HEADER PANEL ===== */}
            <div className="flex items-center justify-between">

                <h3 className="text-sm font-semibold text-gray-800">
                    Editar rúbrica
                </h3>

                <button
                    type="button"
                    onClick={onCancel}
                    className="
                        p-1 rounded-lg
                        hover:bg-gray-100
                        transition
                    "
                    aria-label="Cancelar edición"
                >
                    <X size={16} className="text-gray-500" />
                </button>

            </div>

            {/* ===== CAMPOS ===== */}

            <FormField
                type="text"
                name="title"
                label="Título"
                value={values.title}
                onChange={handleChange}
                placeholder="Ej. Rúbrica de comunicación oral"
                required
            />

            <FormField
                type="textarea"
                name="description"
                label="Descripción"
                value={values.description}
                onChange={handleChange}
                placeholder="Describe el propósito de esta rúbrica..."
                rows={3}
                maxLength={300}
                showCount
            />

            <FormField
                type="checkbox"
                name="is_public"
                label="Rúbrica pública (visible para estudiantes)"
                value={values.is_public}
                onChange={handleChange}
            />

            {/* ===== ACCIONES ===== */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="
                        h-9 px-4
                        rounded-xl
                        border border-gray-200
                        text-sm text-gray-600
                        hover:bg-gray-50
                        transition
                        disabled:opacity-60
                    "
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="
                        h-9 px-4
                        rounded-xl
                        bg-green-600
                        text-white text-sm font-medium
                        hover:bg-green-700
                        transition
                        flex items-center gap-1.5
                        disabled:opacity-60
                    "
                >
                    <Check size={14} />
                    {saving ? "Guardando..." : "Guardar"}
                </button>

            </div>

        </form>
    );
};

// ─────────────────────────────────────────────────────────────
//  Sub-componente: RubricInfoCard
//
//  SRP  → solo muestra el resumen de la rúbrica + botón editar.
//  ISP  → recibe solo lo que necesita mostrar.
// ─────────────────────────────────────────────────────────────

interface RubricInfoCardProps {
    rubric: Rubric;
    onStartEditing: () => void;
}

const RubricInfoCard = ({
    rubric,
    onStartEditing,
}: RubricInfoCardProps) => (

    <div
        className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-5
        "
    >

        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between gap-3 mb-3">

            <h3 className="text-sm font-semibold text-gray-800 leading-snug">
                {rubric.title || "Sin título"}
            </h3>

            <button
                onClick={onStartEditing}
                className="
                    p-1.5 rounded-lg
                    hover:bg-gray-100
                    transition
                    flex-shrink-0
                "
                aria-label="Editar rúbrica"
            >
                <Pencil size={14} className="text-gray-500" />
            </button>

        </div>

        {/* Descripción */}
        {rubric.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-3">
                {rubric.description}
            </p>
        )}

        {/* Visibilidad */}
        <span
            className={`
                inline-flex items-center
                text-xs font-medium
                px-2 py-0.5
                rounded-full
                ${rubric.is_public
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }
            `}
        >
            {rubric.is_public ? "Pública" : "Privada"}
        </span>

    </div>
);

// ─────────────────────────────────────────────────────────────
//  Constante — ID rúbrica activa
//  (en un sistema real vendría de useParams o del store)
// ─────────────────────────────────────────────────────────────

const RUBRIC_ID = "8d50acfb-cc75-4b6f-b6ee-b3785842d9f0";

// ─────────────────────────────────────────────────────────────
//  RubricScaleDefinitionPage
//
//  SRP  → coordina flujo, side effects y composición.
//          No renderiza tablas complejas ni lógica de UI.
//  OCP  → secciones extendibles via nuevos sub-componentes.
//  LSP  → sub-componentes son intercambiables por otros que
//          respeten la misma interfaz de props.
//  ISP  → cada sub-componente recibe solo sus props relevantes.
//  DIP  → depende de servicios/hooks (abstracciones), no de
//          implementaciones de fetch directas.
// ─────────────────────────────────────────────────────────────

const RubricScaleDefinitionPage = () => {

    // ── Estado rúbrica ─────────────────────────────────────

    const [rubric, setRubric] =
        useState<Rubric | null>(null);

    const [criteria, setCriteria] =
        useState<Criteria[]>([]);

    const [loadingRubric, setLoadingRubric] =
        useState(false);

    const [savingRubric, setSavingRubric] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    // ── Edición rúbrica ────────────────────────────────────

    const [editingRubric, setEditingRubric] =
        useState(false);

    // ── Criterio seleccionado ──────────────────────────────

    const [selectedCriterion, setSelectedCriterion] =
        useState<Criteria | null>(null);

    // ── Hook escalas ──────────────────────────────────────

    const {
        allScales,      // ← nuevo
        scales,
        loading,
        saving,
        createScale,
        updateScale,
        deleteScale,
    } = useScaleDefinition({
        criterionId: selectedCriterion?.id,
    });

    // ── Carga inicial ──────────────────────────────────────

    const loadRubric = async () => {

        try {

            setLoadingRubric(true);
            setError(null);

            const rubricResponse =
                await rubricService.getById(RUBRIC_ID);

            if (!rubricResponse) return;

            setRubric(rubricResponse);

            const criteriaResponse =
                await criteriaService.getAll();

            const rubricCriteria = criteriaResponse.filter(
                (criterion: Criteria) =>
                    criterion.rubric_id === rubricResponse.id
            );

            setCriteria(rubricCriteria);

            if (rubricCriteria.length > 0) {
                setSelectedCriterion(rubricCriteria[0]);
            }

        } catch {

            setError("No fue posible cargar la rúbrica.");

        } finally {

            setLoadingRubric(false);
        }
    };

    // ── Guardar edición rúbrica ────────────────────────────

    /**
     * SRP: la página gestiona la confirmación y el toast.
     * RubricEditPanel no sabe nada de servicios.
     */
    const handleSaveRubric = async (patch: Partial<Rubric>) => {

        if (!rubric?.id) return;

        try {

            setSavingRubric(true);

            const updated = await rubricService.update(
                rubric.id,
                patch
            );

            if (!updated) throw new Error();

            setRubric(updated);
            setEditingRubric(false);

            await Swal.fire({
                title: "Rúbrica actualizada",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

        } catch {

            Swal.fire({
                title: "Error",
                text: "No fue posible actualizar la rúbrica.",
                icon: "error",
            });

        } finally {

            setSavingRubric(false);
        }
    };

    // ── Eliminar nivel ─────────────────────────────────────

    /**
     * SRP: la página gestiona confirmaciones y notificaciones.
     * ScaleLevelsTable solo emite el evento.
     */
    const handleDeleteScale = async (id: string) => {

        const result = await Swal.fire({
            title: "¿Eliminar nivel?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        await deleteScale(id);

        await Swal.fire({
            title: "Nivel eliminado",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                confirmButton: "swal-confirm-btn",
            },
        });
    };

    // ── Derivados ──────────────────────────────────────────

    const totalLevels = useMemo(() => scales.length, [scales]);

    // ── Efecto inicial ─────────────────────────────────────

    useEffect(() => {
        loadRubric();
    }, []);

    // ── Render ─────────────────────────────────────────────

    return (

        <div className="space-y-6">

            {/* ===== HEADER ===== */}
            <PageHeader
                title="Definir criterios y escalas"
                subtitle="
                    Configura los niveles de desempeño
                    asociados a cada criterio de la rúbrica.
                "
            />

            {/* ===== ERROR ===== */}
            {error && (
                <div
                    className="
                        bg-red-50
                        border border-red-200
                        text-red-600
                        rounded-xl
                        px-4 py-3
                        text-sm
                    "
                >
                    {error}
                </div>
            )}

            {/* ===== GRID PRINCIPAL ===== */}
            <div
                className="
                    grid grid-cols-12
                    gap-6
                    items-start
                "
            >

                {/* ===== SIDEBAR (criterios) ===== */}
                <div className="col-span-3">
                    <CriteriaSidebar
                        criteria={criteria}
                        selectedCriterionId={selectedCriterion?.id}
                        onSelectCriterion={setSelectedCriterion}
                    />
                </div>

                {/* ===== TABLA NIVELES ===== */}
                <div className="col-span-6">
                    <ScaleLevelsTableContainer
                        criterionId={selectedCriterion?.id ?? ""}
                        allScales={allScales}
                        scales={scales}
                        loading={loading}
                        saving={saving}
                        onCreate={createScale}
                        onUpdate={updateScale}
                        onDelete={handleDeleteScale}
                    />
                </div>

                {/* ===== COLUMNA DERECHA ===== */}
                <div className="col-span-3 flex flex-col gap-6">

                    {rubric && (
                        editingRubric ? (
                            <RubricEditPanel
                                rubric={rubric}
                                saving={savingRubric}
                                onSave={handleSaveRubric}
                                onCancel={() => setEditingRubric(false)}
                            />
                        ) : (
                            <RubricInfoCard
                                rubric={rubric}
                                onStartEditing={() => setEditingRubric(true)}
                            />
                        )
                    )}

                    {/* Resumen criterio */}
                    <ScaleSummaryCard
                        criterion={selectedCriterion || undefined}
                        scales={scales}
                    />

                    {/* ── Reglas / total niveles ── */}
                    <div
                        className="
                            bg-white
                            border border-gray-200
                            rounded-2xl
                            p-5
                        "
                    >

                        <h3
                            className="
                                text-sm font-semibold
                                text-gray-800 mb-4
                            "
                        >
                            Reglas
                        </h3>

                        <ul
                            className="
                                flex flex-col gap-3
                                text-sm text-gray-600
                            "
                        >
                            <li>• Deben existir mínimo 2 niveles.</li>
                            <li>• Los nombres no pueden estar vacíos.</li>
                            <li>• Los valores deben ser únicos.</li>
                            <li>
                                • Los niveles deben representar
                                progresión de desempeño.
                            </li>
                        </ul>

                        {/* Total niveles */}
                        <div
                            className="
                                mt-6 pt-4
                                border-t border-gray-100
                            "
                        >
                            <p
                                className="
                                    text-xs uppercase
                                    text-gray-400 mb-1
                                "
                            >
                                Total niveles
                            </p>
                            <p
                                className="
                                    text-2xl font-bold
                                    text-primary
                                "
                            >
                                {totalLevels}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* ===== LOADING OVERLAY ===== */}
            {loadingRubric && (
                <div
                    className="
                        fixed inset-0
                        bg-black/10
                        backdrop-blur-sm
                        flex items-center justify-center
                        z-50
                    "
                >
                    <div
                        className="
                            bg-white
                            px-6 py-4
                            rounded-2xl
                            shadow-lg
                            text-sm text-gray-600
                        "
                    >
                        Cargando rúbrica...
                    </div>
                </div>
            )}

        </div>
    );
};

export default RubricScaleDefinitionPage;
