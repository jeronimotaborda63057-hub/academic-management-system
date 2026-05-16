import { useNavigate } from "react-router-dom";
import { RubricEvaluationList } from "../../components/rubrics/RubricEvaluationList";
import PageHeader from "../../components/ui/PageHeader";
import { useRubricConsultation } from "../../hooks/useRubricConsultation";

const RubricConsultationListPage = () => {
    const navigate = useNavigate();
    const { error, loading, records } = useRubricConsultation();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mis evaluaciones"
                subtitle="Consulta las rubricas publicadas de tus actividades."
                breadcrumb={["Inicio", "Mis evaluaciones"]}
            />

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <RubricEvaluationList
                loading={loading}
                records={records}
                onSelect={(record) =>
                    navigate(`/rubrics/evaluations/${record.evaluation.id}`)
                }
            />
        </div>
    );
};

export default RubricConsultationListPage;
