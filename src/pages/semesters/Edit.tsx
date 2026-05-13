import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SemesterFormComponent from "../../components/forms/SemesterForm";
import { useSemesterForm } from "../../hooks/useSemesterForm";
import { semesterService } from "../../services/semesterService";
import Swal from "sweetalert2";

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [semesters, setSemesters] = useState<any[]>([]);
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "ID no válido",
            });
            navigate("/semesters");
            return;
        }

        const load = async () => {
            try {
                const all = await semesterService.getAll();
                const current = await semesterService.getById(id);

                if (!current) {
                    throw new Error("Semestre no encontrado");
                }

                setSemesters(all);

                // ✅ MAPEO CORRECTO
                setInitialData({
                    id: current.id ?? "",
                    name: current.name ?? "",
                    code: current.code ?? "",
                    start_date: current.start_date ?? "",
                    end_date: current.end_date ?? "",
                    is_active: current.is_active ?? false,
                });

            } catch (error: any) {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.response?.data?.message || "Error al cargar el semestre",
                });

                navigate("/semesters");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, navigate]);

    const handleSubmit = async (values: any) => {
        try {
            await semesterService.update(id!, values);

            await Swal.fire({
                icon: "success",
                title: "Actualizado",
                text: "Semestre actualizado correctamente",
            });

            navigate("/semesters/list");
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Error al actualizar",
            });
        }
    };

    // ⚠️ CLAVE: enableReinitialize
    const formik = useSemesterForm({
        initialValues: initialData || {
            name: "",
            code: "",
            start_date: "",
            end_date: "",
            is_active: false,
        },
        onSubmit: handleSubmit,
        existingSemesters: semesters,
    // 🔥 ESTO SOLUCIONA TU PROBLEMA
    });

    if (loading) return <p>Cargando...</p>;

    return <SemesterFormComponent formik={formik} />;
};
export default Edit;