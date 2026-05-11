import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { semesterService } from "../../services/semesterService";
import { careerService } from "../../services/careerService";
import type { SemesterForm } from "../../models/Semester";
import type { Career } from "../../models/Career";
import PageHeader from "../../components/PageHeader";
import Swal from "sweetalert2";

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [careers, setCareers] = useState<Career[]>([]);
    const [values, setValues] = useState<SemesterForm>({
        career_id: "", code: "", name: "",
        start_date: "", end_date: "", is_active: false,
    });

    useEffect(() => {
        careerService.getAll().then((data) => setCareers(data ?? []));
    }, []);

    useEffect(() => {
        if (!id) return;
        semesterService.getById(id).then((semester) => {
            if (!semester) return;
            setValues({
                career_id:  semester.career_id,
                code:       semester.code,
                name:       semester.name,
                start_date: semester.start_date,
                end_date:   semester.end_date,
                is_active:  semester.is_active,
            });
        });
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsLoading(true);
        try {
            const result = await semesterService.update(id, {
                name:       values.name,
                start_date: values.start_date,
                end_date:   values.end_date,
                is_active:  values.is_active,
            });
            if (!result) throw new Error();
            Swal.fire("Éxito", "Semestre actualizado correctamente.", "success");
            navigate("/semesters/list");
        } catch {
            Swal.fire("Error", "Ocurrió un error al actualizar el semestre.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const baseInput = "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors w-full";
    const labelClass = "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

    return (
        <div>
            <PageHeader
                title="Editar semestre"
                subtitle="Modifica los datos del semestre."
                breadcrumb={["Inicio", "Semestres", "Editar"]}
            />

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-4"
            >
                {/* Carrera — solo lectura en edición */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Carrera</label>
                    <select
                        name="career_id"
                        value={values.career_id}
                        disabled
                        className={`${baseInput} opacity-50 cursor-not-allowed`}
                    >
                        {careers.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Código — solo lectura en edición */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Código <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={values.code}
                        disabled
                        className={`${baseInput} opacity-50 cursor-not-allowed`}
                    />
                </div>

                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        required
                        className={baseInput}
                    />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Fecha inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={values.start_date}
                            onChange={handleChange}
                            required
                            className={baseInput}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Fecha fin <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={values.end_date}
                            onChange={handleChange}
                            required
                            className={baseInput}
                        />
                    </div>
                </div>

                {/* Estado — HU-02 criterio 4 */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="is_active"
                        value={values.is_active ? "true" : "false"}
                        onChange={(e) =>
                            setValues((prev) => ({
                                ...prev,
                                is_active: e.target.value === "true",
                            }))
                        }
                        className={baseInput}
                    >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
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
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {isLoading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Edit;