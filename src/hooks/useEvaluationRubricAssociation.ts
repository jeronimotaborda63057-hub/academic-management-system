import { useEffect, useMemo, useState } from "react";

import { evaluationRubricService } from "../services/evaluationRubricService";

import type { Rubric } from "../models/Rubric";
import type { Evaluation } from "../models/Evaluation";

export function useEvaluationRubricAssociation(
    evaluation: Evaluation | null,
) {
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedRubric, setSelectedRubric] =
        useState<Rubric | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const data = await evaluationRubricService
                    .getPublishedRubrics();
                setRubrics(data);
            }
            finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const filteredRubrics = useMemo(() => {
        return rubrics.filter((rubric) => {
            return rubric.title
                .toLowerCase()
                .includes(search.toLowerCase());
        });
    }, [rubrics, search]);

    return {
        loading,
        search,
        setSearch,
        selectedRubric,
        setSelectedRubric,
        filteredRubrics,
    };
}