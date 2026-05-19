/**
 * components/ErrorBoundary.tsx
 *
 * React class component que captura errores de renderizado en el árbol hijo.
 * Sin esto, un error en cualquier página deja la app en blanco.
 *
 * Uso en App.tsx:
 *   <ErrorBoundary>
 *     <Route ... />
 *   </ErrorBoundary>
 */

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Error desconocido" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-3 p-6">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Algo salió mal
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {this.state.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="mt-2 px-4 py-2 rounded-xl border border-stroke text-sm hover:bg-gray-50 transition"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}