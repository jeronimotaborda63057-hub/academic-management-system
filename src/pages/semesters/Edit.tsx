// src/pages/semesters/Edit.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { semesterService } from "../../services/semesterService";
import { useSemesterForm } from "../../hooks/useSemesterForm";
import { toDateInputValue } from "../../utils/dateUtils";

import FormLayout from "../../components/ui/FormLayout";
import FormField  from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  Edit
//
//  SRP  → carga datos, coordina submit. Validaciones en
//          useSemesterForm; UI en FormLayout/FormField.
//  OCP  → campos nuevos = un <FormField> más.
//  DIP  → depende de semesterService (abstracción).
// ─────────────────────────────────────────────────────────────

const Edit = () => {

    const { id }   = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [semesters,    setSemesters]    = useState<any[]>([]);
    const [initialData,  setInitialData]  = useState<any>(null);
    const [loading,      setLoading]      = useState(true);

    // ── Carga inicial ──────────────────────────────────────

    useEffect(() => {

        if (!id) {
            Swal.fire({ icon: "error", title: "Error", text: "ID no válido." });
            navigate("/semesters/list");
            return;
        }

        const load = async () => {
            try {

                const [all, current] = await Promise.all([
                    semesterService.getAll(),
                    semesterService.getById(id),
                ]);

                if (!current) throw new Error("Semestre no encontrado.");

                setSemesters(all);

                setInitialData({
                    id:         current.id         ?? "",
                    name:       current.name        ?? "",
                    code:       current.code        ?? "",
                    start_date: toDateInputValue(current.start_date),
                    end_date:   toDateInputValue(current.end_date),
                    is_active:  current.is_active   ?? false,
                });

            } catch (error: any) {

                await Swal.fire({
                    icon:  "error",
                    title: "Error",
                    text:  error?.response?.data?.message || "Error al cargar el semestre.",
                });

                navigate("/semesters/list");

            } finally {

                setLoading(false);
            }
        };

        load();

    }, [id, navigate]);

    // ── Submit ─────────────────────────────────────────────

    const handleSubmit = async (values: any) => {
        try {

            await semesterService.update(id!, values);

            await Swal.fire({
                icon:  "success",
                title: "Semestre actualizado",
                text:  "Se guardó correctamente.",
            });

            navigate("/semesters/list");

        } catch (error: any) {

            Swal.fire({
                icon:  "error",
                title: "Error",
                text:  error?.response?.data?.message || "Error al actualizar el semestre.",
            });
        }
    };

    // enableReinitialize dentro del hook asegura que
    // Formik tome los valores cuando initialData llega async.
    const formik = useSemesterForm({
        initialValues:     initialData,
        onSubmit:          handleSubmit,
        existingSemesters: semesters,
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        formik.handleSubmit();
    };

    // ── Loading inicial ────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-500 dark:text-bodydark2">
                    Cargando semestre...
                </p>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────

    return (
        <FormLayout
            title="Editar semestre"
            subtitle="Modifica los datos del semestre académico."
            breadcrumb={["Inicio", "Semestres", "Editar"]}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate("/semesters/list")}
            submitLabel="Guardar cambios"
            isLoading={formik.isSubmitting}
        >

            {/* Nombre */}
            <FormField
                type="text"
                name="name"
                label="Nombre"
                value={formik.values.name}
                onChange={formik.handleChange}
                placeholder="Ej. Semestre I - 2025"
                required
                error={
                    formik.touched.name && formik.errors.name
                        ? formik.errors.name
                        : undefined
                }
            />

            {/* Código */}
            <FormField
                type="text"
                name="code"
                label="Código"
                value={formik.values.code}
                onChange={formik.handleChange}
                placeholder="Ej. 2025-1"
                required
                error={
                    formik.touched.code && formik.errors.code
                        ? formik.errors.code
                        : undefined
                }
            />

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">

                <FormField
                    type="date"
                    name="start_date"
                    label="Fecha de inicio"
                    value={formik.values.start_date}
                    onChange={formik.handleChange}
                    required
                    error={
                        formik.touched.start_date && formik.errors.start_date
                            ? formik.errors.start_date as string
                            : undefined
                    }
                />

                <FormField
                    type="date"
                    name="end_date"
                    label="Fecha de fin"
                    value={formik.values.end_date}
                    onChange={formik.handleChange}
                    required
                    error={
                        formik.touched.end_date && formik.errors.end_date
                            ? formik.errors.end_date as string
                            : undefined
                    }
                />

            </div>

            {/* Activo */}
            <FormField
                type="checkbox"
                name="is_active"
                label="Semestre activo"
                value={formik.values.is_active}
                onChange={formik.handleChange}
                error={
                    formik.touched.is_active && formik.errors.is_active
                        ? formik.errors.is_active as string
                        : undefined
                }
            />

        </FormLayout>
    );
};

export default Edit;
