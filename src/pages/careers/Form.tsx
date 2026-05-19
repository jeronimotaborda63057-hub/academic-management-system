/**
 * Careers/Form.tsx — HU-02 (Crear / Editar carrera)
 *
 * SOLID aplicado:
 * - SRP  : este componente gestiona el formulario de una carrera. La validación
 *          de negocio (código único) la responde el backend; aquí solo manejamos
 *          el estado del formulario y los mensajes al usuario.
 * - OCP  : el subcomponente <Field> permite agregar campos sin tocar el JSX
 *          principal — solo se añade otra instancia.
 * - LSP  : CareerService extiende BaseService; create() y update() se usan
 *          aquí sin saber el tipo concreto del servicio.
 * - DIP  : dependemos del servicio importado, no de axios.
 *
 * Criterios HU-02 cubiertos:
 *   ✅ 1 — Crear carrera con nombre y código único
 *   ✅ 2 — Editar carrera (nombre, descripción)
 *   ❌ E1 — Código duplicado: el backend retorna error; aquí lo interceptamos
 *           y mostramos un mensaje específico al usuario.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import type { CareerForm } from "../../models/uml/Career";
import { careerService } from "../../services/careerService";
import PageHeader from "../../components/ui/PageHeader";

type SaveResult = Awaited<ReturnType<typeof careerService.create>>;

function isDuplicateCareerError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    return error.message.includes("duplicate");
}

// ─── Subcomponente de campo (SRP: solo renderiza un input) ────────────────────
const Field = ({
    label, name, value, onChange,
    type = "text", required = false, disabled = false,
    hint,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const CareerForm: React.FC = () => {
    const { id }    = useParams<{ id: string }>();
    const navigate  = useNavigate();
    const isEdit    = Boolean(id);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<CareerForm>({
        name: "",
        code: "",
        description: "",
        is_active: true,
    });

    // Si es edición, precarga los datos
    useEffect(() => {
        if (!id) return;
        careerService.getById(id).then((career) => {
            if (!career) return;
            setForm({
                name:        career.name,
                code:        career.code,
                description: career.description ?? "",
                is_active:   career.is_active,
            });
        });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let ok: SaveResult;
            if (isEdit && id) {
                // En edición solo se permite cambiar nombre y descripción (no el código)
                ok = await careerService.update(id, {
                    name:        form.name,
                    description: form.description,
                });
            } else {
                ok = await careerService.create(form);
            }

            if (!ok) throw new Error("SAVE_FAILED");

            Swal.fire(
                "¡Listo!",
                `Carrera ${isEdit ? "actualizada" : "creada"} correctamente.`,
                "success",
            );
            navigate("/careers/list");

        } catch (err: unknown) {
            // E1: código duplicado (el backend lo notifica con 409/400)
            if (isDuplicateCareerError(err)) {
                Swal.fire("Código duplicado", "Ya existe una carrera con ese código.", "error");
            } else {
                Swal.fire("Error", "No se pudo guardar la carrera.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                title={isEdit ? "Editar carrera" : "Nueva carrera"}
                subtitle={
                    isEdit
                        ? "Modifica el nombre o descripción de la carrera."
                        : "Completa el formulario para registrar una nueva carrera."
                }
                breadcrumb={["Inicio", "Académico", "Carreras", isEdit ? "Editar" : "Crear"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label="Nombre"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <Field
                        label="Código"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        required
                        // HU-02: el código no se puede editar una vez creado
                        disabled={isEdit}
                        hint={isEdit ? "El código no puede modificarse." : "Debe ser único en el sistema."}
                    />
                </div>

                <Field
                    label="Descripción"
                    name="description"
                    value={form.description ?? ""}
                    onChange={handleChange}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/careers/list")}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear carrera"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CareerForm;
