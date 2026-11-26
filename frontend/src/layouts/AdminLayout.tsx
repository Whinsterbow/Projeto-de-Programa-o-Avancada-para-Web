
import { useState } from "react";

import {
  NavLink,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import "../styles/admin.css";

const menu = [
  {
    nome: "Dashboard",
    rota: "/",
    icone: "▦",
  },
  {
    nome: "Autores",
    rota: "/autores",
    icone: "✎",
  },
  {
    nome: "Livros",
    rota: "/livros",
    icone: "📖",
  },
  {
    nome: "Leitores",
    rota: "/leitores",
    icone: "👤",
  },
  {
    nome: "Empréstimos",
    rota: "/emprestimos",
    icone: "⇄",
  },
];

export default function AdminLayout() {
  const { usuario, logout } = useAuth();

  const [menuAberto, setMenuAberto] =
    useState(false);

  const inicial =
    usuario?.nome.charAt(0).toUpperCase() || "U";

  return (
    <div className="admin-layout">
      {menuAberto && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`sidebar ${
          menuAberto ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <span className="sidebar-logo">📚</span>

          <div>
            <h2>Biblioteca</h2>
            <p>Sistema de gestão</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <span className="sidebar-label">
            MENU PRINCIPAL
          </span>

          <nav aria-label="Menu principal">
            {menu.map((item) => (
              <NavLink
                key={item.rota}
                to={item.rota}
                end={item.rota === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={() =>
                  setMenuAberto(false)
                }
              >
                <span className="sidebar-icon">
                  {item.icone}
                </span>

                {item.nome}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="logout-button"
            onClick={logout}
          >
            <span>↪</span>
            Sair do sistema
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <button
              className="mobile-menu-button"
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              onClick={() =>
                setMenuAberto(!menuAberto)
              }
            >
              ☰
            </button>

            <span>Painel administrativo</span>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {inicial}
            </div>

            <div className="user-info">
              <strong>{usuario?.nome}</strong>
              <span>{usuario?.email}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
