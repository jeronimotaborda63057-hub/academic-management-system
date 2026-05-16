/**
 * Semesters/Form.tsx — HU-02 (Crear / Editar semestre)
 *
 * SOLID aplicado:
 * - SRP  : maneja solo el formulario de un semestre.
 * - OCP  : validación de fechas encapsulada en una función pura.
 * - DIP  : usa semesterService (abstracción), no axios.
 *
 * Criterios HU-02 cubiertos:
 *   ✅ 2 — Fecha de inicio, fin y estado
 *   ✅ E2 — fecha_inicio >= fecha_fin → bloqueado con mensaje
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import type { SemesterForm } from "../../models/SemesterForm";
import { semesterService } from "../../services/semesterService";
import PageHeader from "../../components/ui/PageHeader";

// ── Subcomponente de campo (reutilizable, SRP) ────────────────────────────────
const Field = ({
    label, name, value, onChange,
    type = "text", required = false, disabled = false, hint,
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string; required?: boolean; disabled?: boolean; hint?: string;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type} name={name} value={value}
            onChange={onChange} required={required} disabled={disabled}
            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
);

// ── Validación pura (OCP: no modifica el componente al agregar reglas) ────────
/**
 * Valida que la fecha de inicio sea anterior a la de fin.
 * Retorna null si es válido, o un string con el error.
 *
 * Principio: las funciones de validación puras son fáciles de testear
 * y de extender sin tocar el componente.
 */
const validateDates = (start: string, end: string): string | null => {
    if (!start || !end) return null; // campos vacíos — HTML required los captura
    if (new Date(start) >= new Date(end)) {
        return "La fecha de inicio debe ser anterior a la fecha de fin.";
    }
    return null;
};

// ── Componente principal ──────────────────────────────────────────────────────

const SemesterFormPage: React.FC = () => {
    const { id }   = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit   = Boolean(id);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<SemesterForm>({
        name:       "",
        code:       "",
        start_date: "",
        end_date:   "",
        is_active:  false,
    });

    // Precarga en edición
    useEffect(() => {
        if (!id) return;
        semesterService.getById(id).then((s) => {
            if (!s) return;
            setForm({
                name:       s.name,
                code:       s.code,
                // ISO → YYYY-MM-DD para que los inputs date lo muestren bien
                start_date: s.start_date.slice(0, 10),
                end_date:   s.end_date.slice(0, 10),
                is_active:  s.is_active,
            });
        });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // HU-02 E2: validar fechas antes de llamar al servidor
        const dateError = validateDates(form.start_date, form.end_date);
        if (dateError) {
            Swal.fire("Fechas inválidas", dateError, "warning");
            return;
        }

        setLoading(true);
        try {
            let ok: any;
            if (isEdit && id) {
                ok = await semesterService.update(id, form);
            } else {
                ok = await semesterService.create(form);
            }

            if (!ok) throw new Error("SAVE_FAILED");

            Swal.fire(
                "¡Listo!",
                `Semestre ${isEdit ? "actualizado" : "creado"} correctamente.`,
                "success",
            );
            navigate("/semesters/list");

        } catch {
            Swal.fire("Error", "No se pudo guardar el semestre.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title={isEdit ? "Editar semestre" : "Nuevo semestre"}
                subtitle={
                    isEdit
                        ? "Modifica los datos del semestre."
                        : "Registra un nuevo periodo académico."
                }
                breadcrumb={["Inicio", "Académico", "Semestres", isEdit ? "Editar" : "Crear"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label="Nombre"   name="name"
                        value={form.name} onChange={handleChange} required
                    />
                    <Field
                        label="Código"   name="code"
                        value={form.code} onChange={handleChange} required
                        disabled={isEdit}
                        hint={isEdit ? "El código no puede modificarse." : undefined}
                    />
                </div>

                {/* Fechas — HU-02 criterio 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label="Fecha de inicio" name="start_date"
                        type="date" value={form.start_date}
                        onChange={handleChange} required
                    />
                    <Field
                        label="Fecha de fin" name="end_date"
                        type="date" value={form.end_date}
                        onChange={handleChange} required
                    />
                </div>

                {/* Estado — en creación por defecto false (inactivo) */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                        className="w-4 h-4 accent-green-600"
                    />
                    <label htmlFor="is_active" className="text-sm text-black dark:text-white">
                        Marcar como semestre activo
                        <span className="ml-2 text-xs text-gray-400">
                            (desactivará el semestre activo actual)
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/semesters/list")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit" disabled={loading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear semestre"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SemesterFormPage;
