// src/pages/semesters/Create.tsx

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import Swal from "sweetalert2";

import type { Semester }         from "../../models/Semester";
import { semesterService }       from "../../services/semesterService";
import { useSemesterForm }       from "../../hooks/useSemesterForm";

import FormLayout from "../../components/ui/FormLayout";
import FormField  from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  Create
//
//  SRP  → carga semestres existentes (para validación de activo),
//          coordina submit. Validaciones en useSemesterForm.
//  DIP  → depende de semesterService (abstracción).
// ─────────────────────────────────────────────────────────────

const Create = () => {

    const navigate = useNavigate();

    const [semesters, setSemesters] = useState<Semester[]>([]);

    // ── Carga semestres existentes ─────────────────────────
    // (necesarios para la validación "solo un activo")

    useEffect(() => {
        semesterService.getAll().then(setSemesters);
    }, []);

    // ── Submit ─────────────────────────────────────────────

    const handleSubmit = async (values: any) => {
        try {

            await semesterService.create(values);

            await Swal.fire({
                icon:  "success",
                title: "Semestre creado",
                text:  "Se guardó correctamente.",
            });

            navigate("/semesters/list");

        } catch (error: any) {

            Swal.fire({
                icon:  "error",
                title: "Error",
                text:  error?.response?.data?.message || "Error al crear el semestre.",
            });
        }
    };

    const formik = useSemesterForm({
        onSubmit:          handleSubmit,
        existingSemesters: semesters,
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        formik.handleSubmit();
    };

    // ── Render ─────────────────────────────────────────────

    return (
        <FormLayout
            title="Nuevo semestre"
            subtitle="Completa los datos para registrar un nuevo semestre."
            breadcrumb={["Inicio", "Semestres", "Crear"]}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate("/semesters/list")}
            submitLabel="Crear semestre"
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

export default Create;