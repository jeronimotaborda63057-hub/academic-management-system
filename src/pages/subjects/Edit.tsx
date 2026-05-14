// src/pages/subjects/Edit.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { subjectService } from "../../services/subjectService";

import FormLayout from "../../components/ui/FormLayout";
import FormField  from "../../components/ui/FormField";

// ─────────────────────────────────────────────────────────────
//  State shape
// ─────────────────────────────────────────────────────────────

interface SubjectEditValues {
    code:        string;
    name:        string;
    description: string;
    credits:     string;
}

const INITIAL: SubjectEditValues = {
    code:        "",
    name:        "",
    description: "",
    credits:     "1",
};

// ─────────────────────────────────────────────────────────────
//  Edit
//
//  SRP  → coordina carga, estado y submit. El renderizado
//          está delegado a FormLayout + FormField.
//  OCP  → agregar campos = sumar <FormField>; no tocar lógica.
//  LSP  → no rompe contratos de FormLayout ni FormField.
//  ISP  → pasa solo las props que cada componente necesita.
//  DIP  → depende de subjectService (abstracción), no de axios.
// ─────────────────────────────────────────────────────────────

const Edit: React.FC = () => {

    const { id }   = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [values,    setValues]    = useState<SubjectEditValues>(INITIAL);
    const [isLoading, setIsLoading] = useState(false);
    const [fetching,  setFetching]  = useState(true);

    // ── Carga inicial ──────────────────────────────────────

    useEffect(() => {

        if (!id) return;

        subjectService.getById(id).then((subject) => {

            if (!subject) return;

            setValues({
                code:        subject.code,
                name:        subject.name,
                description: subject.description ?? "",
                credits:     String(subject.credits),
            });

        }).finally(() => setFetching(false));

    }, [id]);

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
        if (!id) return;

        setIsLoading(true);

        try {

            const result = await subjectService.update(id, {
                name:        values.name,
                description: values.description,
                credits:     Number(values.credits),
            });

            if (!result) throw new Error();

            await Swal.fire({
                icon:  "success",
                title: "Éxito",
                text:  "Asignatura actualizada correctamente.",
            });

            navigate("/subjects/list");

        } catch {

            Swal.fire({
                icon:  "error",
                title: "Error",
                text:  "Ocurrió un error al actualizar la asignatura.",
            });

        } finally {

            setIsLoading(false);
        }
    };

    // ── Loading inicial ────────────────────────────────────

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-40">
                <p className="text-sm text-gray-500 dark:text-bodydark2">
                    Cargando asignatura...
                </p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────

    return (
        <FormLayout
            title="Editar asignatura"
            subtitle="Modifica los datos de la asignatura."
            breadcrumb={["Inicio", "Asignaturas", "Editar"]}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/subjects/list")}
            submitLabel="Guardar cambios"
            isLoading={isLoading}
        >

            {/* Código — solo lectura (HU-04 criterio 2) */}
            <FormField
                type="text"
                name="code"
                label="Código"
                value={values.code}
                disabled
                hint="El código no se puede modificar."
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

export default Edit;