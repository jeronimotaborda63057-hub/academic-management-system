// src/pages/subjects/Create.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { subjectService } from "../../services/subjectService";
import type { SubjectForm } from "../../models/Subject";

import FormLayout from "../../components/ui/FormLayout";
import FormField  from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  State shape
// ─────────────────────────────────────────────────────────────

interface SubjectCreateValues {
    code:        string;
    name:        string;
    description: string;
    credits:     string;
}

const INITIAL: SubjectCreateValues = {
    code:        "",
    name:        "",
    description: "",
    credits:     "1",
};

// ─────────────────────────────────────────────────────────────
//  Create
//
//  SRP  → solo coordina estado y submit.
//  OCP  → campos nuevos = un <FormField> más.
//  DIP  → depende de subjectService, no de axios.
// ─────────────────────────────────────────────────────────────

const Create: React.FC = () => {

    const navigate = useNavigate();

    const [values,    setValues]    = useState<SubjectCreateValues>(INITIAL);
    const [isLoading, setIsLoading] = useState(false);

    // ── Handlers ──────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setIsLoading(true);

        try {

            const payload: SubjectForm = {
                code:        values.code,
                name:        values.name,
                description: values.description,
                credits:     Number(values.credits),
                is_active:   true,
            };

            const result = await subjectService.create(payload);

            if (!result) throw new Error();

            await Swal.fire({
                icon:  "success",
                title: "Éxito",
                text:  "Asignatura creada correctamente.",
            });

            navigate("/subjects/list");

        } catch (error: any) {

            const isDuplicate = error.response?.status === 409;

            Swal.fire({
                icon:  "error",
                title: "Error",
                text:  isDuplicate
                    ? "Ya existe una asignatura con ese código."
                    : "Ocurrió un error al crear la asignatura.",
            });

        } finally {

            setIsLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────

    return (
        <FormLayout
            title="Nueva asignatura"
            subtitle="Completa los datos para registrar una nueva asignatura."
            breadcrumb={["Inicio", "Asignaturas", "Crear"]}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/subjects/list")}
            submitLabel="Guardar asignatura"
            isLoading={isLoading}
        >

            {/* Código */}
            <FormField
                type="text"
                name="code"
                label="Código"
                value={values.code}
                onChange={handleChange}
                placeholder="Ej. MAT-101"
                required
            />

            {/* Nombre */}
            <FormField
                type="text"
                name="name"
                label="Nombre"
                value={values.name}
                onChange={handleChange}
                placeholder="Ej. Matemáticas I"
                required
            />

            {/* Créditos */}
            <FormField
                type="number"
                name="credits"
                label="Créditos"
                value={values.credits}
                onChange={handleChange}
                min={1}
                max={20}
                required
            />

            {/* Descripción */}
            <FormField
                type="textarea"
                name="description"
                label="Descripción"
                value={values.description}
                onChange={handleChange}
                placeholder="Describe la asignatura..."
                rows={3}
                maxLength={200}
                showCount
            />

        </FormLayout>
    );
};

export default Create;