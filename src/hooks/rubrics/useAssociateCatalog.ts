import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { evaluationRubricService } from "../../services/evaluationRubricService";
import { normalizeGroups } from "../../utils/rubric/AssociateRubricUtils";
import type { CatalogsState } from "../../models/rubric/CataalogsState";

export const useAssociateCatalogs = (): CatalogsState => {
    const [state, setState] = useState<CatalogsState>({
        evaluations: [],
        rubrics: [],
        subjects: [],
        groups: [],
        loading: true,
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [rubricsData, subjectsData, groupsData, evaluationsData] =
                    await Promise.all([
                        evaluationRubricService.getPublishedRubrics(),
                        evaluationRubricService.getSubjects(),
                        evaluationRubricService.getGroups(),
                        evaluationRubricService.getAllEvaluations(),
                    ]);

                setState({
                    rubrics: rubricsData ?? [],
                    subjects: subjectsData ?? [],
                    groups: normalizeGroups(groupsData),
                    evaluations: evaluationsData ?? [],
                    loading: false,
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los catálogos.",
                });
                setState((prev) => ({ ...prev, loading: false }));
            }
        };

        load();
    }, []);

    return state;
};