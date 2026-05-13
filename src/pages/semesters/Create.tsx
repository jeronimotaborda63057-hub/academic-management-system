import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SemesterFormComponent from "../../components/forms/SemesterForm";
import { useSemesterForm } from "../../hooks/useSemesterForm";
import { semesterService } from "../../services/semesterService";
import Swal from "sweetalert2";
import type { Semester } from "../../models/Semester";

const Create = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState<Semester[]>([]);

    useEffect(() => {
        semesterService.getAll().then(setSemesters);
    }, []);

    const handleSubmit = async (values: any) => {
        try {
            await semesterService.create(values);

            await Swal.fire({
                icon: "success",
                title: "Semestre creado",
                text: "Se guardó correctamente",
            });

            navigate("/semesters/list");
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Error al crear",
            });
        }
    };

    const formik = useSemesterForm({
        onSubmit: handleSubmit,
        existingSemesters: semesters,
    });

    return <SemesterFormComponent formik={formik} />;
};
export default Create;