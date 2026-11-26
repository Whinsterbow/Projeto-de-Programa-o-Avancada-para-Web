
import type { ReactNode } from "react";

import "../styles/auth.css";

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

export default function AuthLayout({
  titulo,
  subtitulo,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-container">
      <section className="auth-presentation">
        <div className="auth-presentation-content">
          <div className="auth-logo">📚</div>

          <h1>Sistema de Biblioteca</h1>

          <p>
            Gerencie seu acervo, leitores e
            empréstimos em um único lugar.
          </p>

          <ul className="auth-benefits">
            <li>Gestão de autores e livros</li>
            <li>Controle de leitores</li>
            <li>Gerenciamento de empréstimos</li>
            <li>Acesso seguro ao sistema</li>
          </ul>
        </div>

        <footer>
          Sistema de Gerenciamento de Biblioteca
        </footer>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-card">
          <h2>{titulo}</h2>

          <p className="auth-subtitle">
            {subtitulo}
          </p>

          {children}
        </div>
      </section>
    </main>
  );
}
