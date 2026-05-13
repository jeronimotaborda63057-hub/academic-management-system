import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import type { CareerForm as CareerFormType } from "../../models/CareerForm";
import { careerService } from "../../services/careerService";
import CareerForm from "../../components/forms/CareerForm";

export default function Create() {

    const navigate = useNavigate();

    const handleSubmit = async (data: CareerFormType) => {
        try {
            await careerService.create(data);

            await Swal.fire({
                icon: "success",
                title: "Carrera creada",
                text: "Se guardó correctamente",
            });

            navigate("/careers/list");

        } catch (error) {
            Swal.fire("Error", "No se pudo crear", "error");
        }
    };

    return (
        <CareerForm
            initialValues={{
                code: "",
                name: "",
                description: "",
                is_active: true,
            }}
            onSubmit={handleSubmit}
        />
    );
}