/**
 * pages/NotFound.tsx
 *
 * Página 404. Sin esto, una ruta inexistente mostraba pantalla en blanco.
 * Registrar en App.tsx como:  <Route path="*" element={<NotFound />} />
 */

import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <span className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</span>
      <h1 className="text-xl font-semibold text-black dark:text-white">
        Página no encontrada
      </h1>
      <p className="text-sm text-gray-500">
        La ruta que buscas no existe o no tienes permisos para verla.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition"
      >
        Volver al inicio
      </button>
    </div>
  );
}