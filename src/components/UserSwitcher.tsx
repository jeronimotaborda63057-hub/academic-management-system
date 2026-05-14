/**
 * UserSwitcher.tsx
 *
 * Widget de desarrollo para cambiar rápidamente entre usuarios de prueba.
 * Solo se renderiza en modo desarrollo (import.meta.env.DEV).
 *
 * INSTALACIÓN:
 *   Colócalo al final de tu <App /> o layout raíz:
 *
 *   import { UserSwitcher } from './components/dev/UserSwitcher';
 *
 *   function App() {
 *     return (
 *       <>
 *         <RouterOutlet />
 *         <UserSwitcher />   ← aquí
 *       </>
 *     );
 *   }
 *
 * NOTA SOBRE TOKENS:
 *   Este componente hace dispatch(setUser(...)) directamente, sin pasar
 *   por el endpoint de login. Si tu authInterceptor valida el access_token
 *   en localStorage, asegúrate de que en desarrollo tenga un valor dummy
 *   o ajusta el interceptor para omitir la validación en DEV.
 *   El componente escribe "dev-token" como placeholder.
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";        // ← ajusta la ruta
import type { User } from "../models/User";
import type { RootState } from "../store/store";
import { setUser } from "../store/userSlice";

// ─── Usuarios de prueba (seed del backend) ────────────────────────────────────

const TEST_USERS: User[] = [
    {
        id: "b4c775dc-094a-4a14-8be5-8795e05bd132",
        email: "admin@example.com",
        code: "ADM-001",
        role: "ADMIN",
        is_active: true,
    },
    {
        id: "9e916a98-2c1b-4d39-a14a-9385acdbe8e6",
        email: "teacher2@example.com",
        code: "TCH-002",
        role: "TEACHER",
        is_active: true,
    },
    {
        id: "eba7624b-f76b-458d-8b4b-9c1bc40e24c1",
        email: "teacher3@example.com",
        code: "TCH-003",
        role: "TEACHER",
        is_active: true,
    },
    {
        id: "651b6e9d-2f74-4a2b-bc33-0afc1c433310",
        email: "student1@example.com",
        code: "STU-001",
        role: "STUDENT",
        is_active: true,
    },
    {
        id: "9dff4d5a-33a5-4565-9355-5ecd10a21fb9",
        email: "student2@example.com",
        code: "STU-002",
        role: "STUDENT",
        is_active: true,
    },
    {
        id: "a9664b8d-169c-4500-83a5-35a196c1e6f2",
        email: "student3@example.com",
        code: "STU-003",
        role: "STUDENT",
        is_active: true,
    },
];

// ─── Configuración visual por rol ────────────────────────────────────────────

const ROLE_CONFIG = {
    ADMIN: {
        label: "Admin",
        badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
        dot: "bg-rose-400",
        icon: "⚙",
    },
    TEACHER: {
        label: "Teacher",
        badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        dot: "bg-amber-400",
        icon: "✦",
    },
    STUDENT: {
        label: "Student",
        badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
        dot: "bg-sky-400",
        icon: "◈",
    },
} as const;

const ROLE_ORDER: User["role"][] = ["ADMIN", "TEACHER", "STUDENT"];

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserSwitcher() {
    // Solo en desarrollo
    if (!import.meta.env.DEV) return null;

    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user.user);
    const [open, setOpen] = useState(false);

    const handleSwitch = (user: User) => {
        // Escribe un token dummy para que el interceptor no bloquee en DEV
        localStorage.setItem("access_token", "dev-token");
        localStorage.setItem("token_type", "bearer");
        dispatch(setUser(user));
    };

    const grouped = ROLE_ORDER.map((role) => ({
        role,
        users: TEST_USERS.filter((u) => u.role === role),
    }));

    const cfg = currentUser ? ROLE_CONFIG[currentUser.role] : null;

    return (
        <>
            {/* ── Estilos inline para la fuente y animaciones ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

        .usw-root {
          font-family: 'JetBrains Mono', monospace;
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .usw-panel {
          background: #0d0d14;
          border: 1px solid #2a2a3d;
          border-radius: 14px;
          padding: 14px;
          width: 260px;
          box-shadow: 0 0 0 1px #1a1a2e, 0 24px 48px rgba(0,0,0,0.6);
          animation: usw-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        @keyframes usw-slide-up {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .usw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1e1e2e;
        }

        .usw-title {
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a4a6a;
          font-weight: 600;
        }

        .usw-dev-badge {
          font-size: 8px;
          letter-spacing: 0.1em;
          background: #1e1e2e;
          color: #5a5a8a;
          border-radius: 4px;
          padding: 2px 6px;
        }

        .usw-section-label {
          font-size: 8px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3a3a5a;
          margin: 10px 0 5px;
          font-weight: 600;
        }

        .usw-user-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 8px 9px;
          margin-bottom: 3px;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
          text-align: left;
        }

        .usw-user-btn:hover {
          background: #13131f;
          border-color: #2a2a3d;
        }

        .usw-user-btn.active {
          background: #13131f;
          border-color: #2a2a3d;
        }

        .usw-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .usw-code {
          font-size: 11px;
          font-weight: 600;
          color: #c8c8e8;
          flex: 1;
        }

        .usw-email {
          font-size: 9px;
          color: #4a4a6a;
          margin-top: 1px;
        }

        .usw-active-mark {
          font-size: 8px;
          color: #5a5a9a;
          margin-left: auto;
        }

        .usw-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0d0d14;
          border: 1px solid #2a2a3d;
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          transition: border-color 0.15s, box-shadow 0.15s;
          color: #c8c8e8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
        }

        .usw-toggle:hover {
          border-color: #3a3a5d;
          box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        }

        .usw-toggle-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .usw-role-pill {
          font-size: 8px;
          letter-spacing: 0.08em;
          border-radius: 5px;
          padding: 2px 6px;
          font-weight: 600;
        }

        .usw-chevron {
          font-size: 10px;
          color: #4a4a6a;
          margin-left: 4px;
          transition: transform 0.2s;
        }

        .usw-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

            <div className="usw-root">
                {/* ── Panel expandido ── */}
                {open && (
                    <div className="usw-panel">
                        <div className="usw-header">
                            <span className="usw-title">User Switcher</span>
                            <span className="usw-dev-badge">DEV ONLY</span>
                        </div>

                        {grouped.map(({ role, users }) => {
                            const rc = ROLE_CONFIG[role];
                            return (
                                <div key={role}>
                                    <div className="usw-section-label">
                                        {rc.icon} {rc.label}s
                                    </div>
                                    {users.map((u) => {
                                        const isActive = currentUser?.id === u.id;
                                        return (
                                            <button
                                                key={u.id}
                                                className={`usw-user-btn${isActive ? " active" : ""}`}
                                                onClick={() => handleSwitch(u)}
                                            >
                                                <span className={`usw-dot ${rc.dot}`} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="usw-code">{u.code}</div>
                                                    <div className="usw-email">{u.email}</div>
                                                </div>
                                                {isActive && (
                                                    <span className="usw-active-mark">◉ actual</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Botón flotante ── */}
                <button className="usw-toggle" onClick={() => setOpen((o) => !o)}>
                    {cfg ? (
                        <>
                            <span className={`usw-toggle-dot ${cfg.dot}`} />
                            <span>{currentUser!.code}</span>
                            <span
                                className={`usw-role-pill ${cfg.badge}`}
                                style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "5px" }}
                            >
                                {cfg.label}
                            </span>
                        </>
                    ) : (
                        <>
                            <span
                                className="usw-toggle-dot"
                                style={{ background: "#3a3a5a" }}
                            />
                            <span style={{ color: "#5a5a8a" }}>Sin usuario</span>
                        </>
                    )}
                    <span className={`usw-chevron${open ? " open" : ""}`}>▲</span>
                </button>
            </div>
        </>
    );
}