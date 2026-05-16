// src/pages/careers/Create.tsx

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import type { CareerForm } from "../../models/CareerForm";
import { careerService }   from "../../services/careerService";
import { useCareerForm }   from "../../hooks/useCareerForm";

import FormLayout from "../../components/ui/FormLayout";
import FormField  from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  Create
//
//  SRP  → solo coordina submit y estado de carga.
//          Validaciones en useCareerForm; UI en FormLayout/FormField.
//  OCP  → campos nuevos = un <FormField> más, sin tocar lógica.
//  DIP  → depende de careerService (abstracción), no de axios.
// ─────────────────────────────────────────────────────────────

const INITIAL: CareerForm = {
    code:        "",
    name:        "",
    description: "",
    is_active:   true,
};

export default function Create() {

    const navigate = useNavigate();

    const handleSubmit = async (data: CareerForm) => {
        try {

            await careerService.create(data);

            await Swal.fire({
                icon:  "success",
                title: "Carrera creada",
                text:  "Se guardó correctamente.",
            });

            navigate("/careers/list");

        } catch {

            Swal.fire({
                icon:  "error",
                title: "Error",
                text:  "No se pudo crear la carrera.",
            });
        }
    };

    const formik = useCareerForm({
        initialValues: INITIAL,
        onSubmit:      handleSubmit,
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        formik.handleSubmit();
    };

    return (
        <FormLayout
            title="Nueva carrera"
            subtitle="Gestiona la información de la carrera académica."
            breadcrumb={["Inicio", "Carreras", "Crear"]}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate("/careers/list")}
            submitLabel="Crear carrera"
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