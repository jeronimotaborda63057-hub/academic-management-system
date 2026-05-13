import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { careerService } from "../../services/careerService";
import CareerForm from "../../components/forms/CareerForm";

export default function EditCareer() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [career, setCareer] = useState<any>(null);

    useEffect(() => {
        const fetch = async () => {
            const data = await careerService.getById(id!);
            setCareer(data);
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: any) => {
        try {
            await careerService.update(id!, data);

            await Swal.fire("Actualizado", "Correctamente", "success");

            navigate("/careers/list");

        } catch {
            Swal.fire("Error", "No se pudo actualizar", "error");
        }
    };

    if (!career) return <p>Cargando...</p>;

    return (
        <CareerForm
            initialValues={career}
            onSubmit={handleSubmit}
            isEdit
        />
    );
}