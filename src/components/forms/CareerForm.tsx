import { useNavigate } from "react-router-dom";
import PageHeader from "../PageHeader";
import type { CareerForm as CareerFormType } from "../../models/CareerForm";
import { useCareerForm } from "../../hooks/useCareerForm";

interface CareerFormProps {
    initialValues: CareerFormType;
    onSubmit: (data: CareerFormType) => Promise<void>;
    isEdit?: boolean;
}

const CareerForm = ({
    initialValues,
    onSubmit,
    isEdit = false,
}: CareerFormProps) => {

    const navigate = useNavigate();
    const formik = useCareerForm({ initialValues, onSubmit });

    return (
        <div>
            <PageHeader
                title={isEdit ? "Editar carrera" : "Nueva carrera"}
                subtitle="Gestiona la información de la carrera académica."
                breadcrumb={["Inicio", "Carreras", isEdit ? "Editar" : "Crear"]}
            />

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 max-w-3xl mx-auto">

                <form onSubmit={formik.handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Código */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Código
                            </label>
                            <input
                                name="code"
                                value={formik.values.code}
                                onChange={formik.handleChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                            {formik.touched.code && formik.errors.code && (
                                <p className="text-red-500 text-xs">{formik.errors.code}</p>
                            )}
                        </div>

                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nombre
                        </label>
                        <input
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-red-500 text-xs">{formik.errors.name}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formik.values.description || ""}
                            onChange={formik.handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-between pt-4 border-t">

                        <button
                            type="button"
                            onClick={() => navigate("/careers/list")}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            {formik.isSubmitting
                                ? "Guardando..."
                                : isEdit
                                ? "Actualizar"
                                : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
export default CareerForm;