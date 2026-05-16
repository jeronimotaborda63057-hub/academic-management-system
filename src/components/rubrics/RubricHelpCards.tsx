import { CalendarCheck, Info } from "lucide-react";

export const RubricHelpCards = () => (
    <div className="space-y-5">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex gap-4">
                <Info className="mt-0.5 flex-shrink-0 text-primary" size={20} />
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        ¿Qué es esta rubrica?
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Esta rubrica define los criterios y niveles de desempeno
                        con los que se evaluará tu trabajo en esta evaluacion.
                    </p>
                </div>
            </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex gap-4">
                <CalendarCheck className="mt-0.5 flex-shrink-0 text-gray-600" size={20} />
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Recordatorio
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Revisa esta rubrica para comprender cómo será evaluado
                        tu desempeño.
                    </p>
                </div>
            </div>
        </div>
    </div>
);