import CareerForm from "../../components/forms/CareerForm";
import { careerService } from "../../services/careerService";
import type { CareerForm as CareerFormType } from "../../models/CareerForm";

const Create: React.FC = () => {
    const initialValues: CareerFormType = {
        code: "",
        name: "",
        is_active: true,
    };

    const handleSubmit = async (data: CareerFormType) => {
        await careerService.create(data);
        console.log("Carrera creada");
    };

    return (
        <CareerForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
        />
    );
}

export default Create;