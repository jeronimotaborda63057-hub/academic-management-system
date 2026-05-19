// src/pages/careers/Edit.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import type { CareerForm } from "../../models/interfaces/CareerForm";
import { careerService } from "../../services/careerService";
import { useCareerForm } from "../../hooks/useCareerForm";

import FormLayout from "../../components/ui/FormLayout";
import FormField from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  Edit
//
//  SRP  → carga datos, coordina submit. Validaciones en
//          useCareerForm; UI en FormLayout/FormField.
//  OCP  → campos nuevos = un <FormField> más.
//  DIP  → depende de careerService (abstracción).
// ─────────────────────────────────────────────────────────────

export default function EditCareer() {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [initialValues, setInitialValues] =
        useState<CareerForm | null>(null);

    // ── Carga inicial ──────────────────────────────────────

    useEffect(() => {
        if (!id) return;

        careerService.getById(id).then((data) => {
            if (!data) return;
            setInitialValues({
                code: data.code,
                name: data.name,
                description: data.description ?? "",
                is_active: data.is_active,
            });
        });
    }, [id]);

    // ── Submit ─────────────────────────────────────────────

    const handleSubmit = async (data: CareerForm) => {
        try {

            await careerService.update(id!, data);

            await Swal.fire({
                icon: "success",
                title: "Carrera actualizada",
                text: "Se guardó correctamente.",
            });

            navigate("/careers/list");

        } catch {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar la carrera.",
            });
        }
    };

    const formik = useCareerForm({
        initialValues: initialValues ?? {
            code: "", name: "", description: "", is_active: true,
        },
        onSubmit: handleSubmit,
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        formik.handleSubmit();
    };

    // ── Loading inicial ────────────────────────────────────

    if (!initialValues) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-500 dark:text-bodydark2">
                    Cargando carrera...
                </p>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────

    return (
        <FormLayout
            title="Editar carrera"
            subtitle="Gestiona la información de la carrera académica."
            breadcrumb={["Inicio", "Carreras", "Editar"]}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate("/careers/list")}
            submitLabel="Guardar cambios"
            isLoading={formik.isSubmitting}
        >

            {/* Código */}
            <FormField
                type="text"
                name="code"
                label="Código"
                value={formik.values.code}
                onChange={formik.handleChange}
                placeholder="Ej. ING-SIS"
                required
                error={
                    formik.touched.code && formik.errors.code
                        ? formik.errors.code
                        : undefined
                }
            />

            {/* Nombre */}
            <FormField
                type="text"
                name="name"
                label="Nombre"
                value={formik.values.name}
                onChange={formik.handleChange}
                placeholder="Ej. Ingeniería de Sistemas"
                required
                error={
                    formik.touched.name && formik.errors.name
                        ? formik.errors.name
                        : undefined
                }
            />

            {/* Descripción */}
            <FormField
                type="textarea"
                name="description"
                label="Descripción"
                value={formik.values.description ?? ""}
                onChange={formik.handleChange}
                placeholder="Describe la carrera..."
                rows={3}
                maxLength={200}
                showCount
                error={
                    formik.touched.description && formik.errors.description
                        ? formik.errors.description
                        : undefined
                }
            />

            {/* Activo */}
            <FormField
                type="checkbox"
                name="is_active"
                label="Carrera activa"
                value={formik.values.is_active}
                onChange={formik.handleChange}
            />

        </FormLayout>
    );
}