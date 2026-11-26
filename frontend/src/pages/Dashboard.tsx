
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import StatCard from "../components/StatCard";

import {
  autorService,
  livroService,
  leitorService,
  emprestimoService,
} from "../services/biblioteca.service";

import type {
  Autor,
  Livro,
  Leitor,
  Emprestimo,
} from "../types/biblioteca";

interface DashboardData {
  autores: Autor[];
  livros: Livro[];
  leitores: Leitor[];
  emprestimos: Emprestimo[];
}

export default function Dashboard() {
  const { usuario } = useAuth();

  const [dados, setDados] =
    useState<DashboardData>({
      autores: [],
      livros: [],
      leitores: [],
      emprestimos: [],
    });

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const [tentativa, setTentativa] =
    useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          autores,
          livros,
          leitores,
          emprestimos,
        ] = await Promise.all([
          autorService.listar(),
          livroService.listar(),
          leitorService.listar(),
          emprestimoService.listar(),
        ]);

        if (ativo) {
          setDados({
            autores,
            livros,
            leitores,
            emprestimos,
          });
        }
      } catch {
        if (ativo) {
          setErro(
            "Não foi possível carregar os dados da biblioteca."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const totalLivros = dados.livros.length;

  const disponiveis = dados.livros.filter(
    (livro) => livro.disponivel
  ).length;

  const indisponiveis =
    totalLivros - disponiveis;

  const emprestimosAtivos =
    dados.emprestimos.filter(
      (emprestimo) =>
        emprestimo.status !== "Devolvido"
    ).length;

  const atrasados = dados.emprestimos.filter(
    (emprestimo) =>
      emprestimo.status === "Atrasado"
  ).length;

  const percentualDisponivel =
    totalLivros > 0
      ? (disponiveis / totalLivros) * 100
      : 0;

  const emprestimosRecentes = [
    ...dados.emprestimos,
  ]
    .sort(
      (a, b) =>
        new Date(b.dataEmprestimo).getTime() -
        new Date(a.dataEmprestimo).getTime()
    )
    .slice(0, 5);

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString(
      "pt-BR",
      { timeZone: "UTC" }
    );
  }

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            Bem-vindo, {usuario?.nome}!
            Confira a situação da biblioteca.
          </p>
        </div>

        <button
          className="button-secondary"
          onClick={() =>
            setTentativa((valor) => valor + 1)
          }
          disabled={carregando}
        >
          ↻ Atualizar
        </button>
      </div>

      {carregando ? (
        <div className="content-card loading-state">
          Carregando dados da biblioteca...
        </div>
      ) : erro ? (
        <div className="content-card">
          <div className="admin-error" role="alert">
            {erro}
          </div>

          <button
            className="button-primary"
            onClick={() =>
              setTentativa((valor) => valor + 1)
            }
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              titulo="Autores"
              valor={dados.autores.length}
              icone="✎"
              cor="blue"
              descricao="Autores cadastrados"
            />

            <StatCard
              titulo="Livros"
              valor={totalLivros}
              icone="📖"
              cor="cyan"
              descricao="Livros no acervo"
            />

            <StatCard
              titulo="Leitores"
              valor={dados.leitores.length}
              icone="👤"
              cor="purple"
              descricao="Leitores cadastrados"
            />

            <StatCard
              titulo="Empréstimos"
              valor={dados.emprestimos.length}
              icone="⇄"
              cor="orange"
              descricao={`${emprestimosAtivos} ativos`}
            />
          </div>

          <div className="dashboard-summary">
            <section className="content-card">
              <h2>Disponibilidade do acervo</h2>

              <p className="card-description">
                Situação atual dos livros cadastrados.
              </p>

              <div
                className="availability-bar"
                role="img"
                aria-label={`${disponiveis} disponíveis e ${indisponiveis} indisponíveis`}
              >
                {totalLivros > 0 && (
                  <>
                    <div
                      className="availability-available"
                      style={{
                        width: `${percentualDisponivel}%`,
                      }}
                    />

                    <div
                      className="availability-unavailable"
                      style={{
                        width: `${
                          100 - percentualDisponivel
                        }%`,
                      }}
                    />
                  </>
                )}
              </div>

              <div className="availability-legend">
                <span>
                  <i className="legend-green" />
                  {disponiveis} disponíveis
                </span>

                <span>
                  <i className="legend-orange" />
                  {indisponiveis} indisponíveis
                </span>
              </div>
            </section>

            <section className="content-card">
              <h2>Situação dos empréstimos</h2>

              <div className="loan-summary">
                <div>
                  <span>Ativos</span>
                  <strong>{emprestimosAtivos}</strong>
                </div>

                <div>
                  <span>Devolvidos</span>
                  <strong>
                    {dados.emprestimos.length -
                      emprestimosAtivos}
                  </strong>
                </div>

                <div>
                  <span>Atrasados</span>
                  <strong className="text-danger">
                    {atrasados}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <section className="content-card">
            <div className="card-heading">
              <h2>Empréstimos recentes</h2>

              <Link
                className="text-link"
                to="/emprestimos"
              >
                Ver todos →
              </Link>
            </div>

            {emprestimosRecentes.length === 0 ? (
              <p className="empty-state">
                Nenhum empréstimo registrado.
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Livro</th>
                      <th>Leitor</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {emprestimosRecentes.map(
                      (emprestimo) => (
                        <tr key={emprestimo.id}>
                          <td>
                            {emprestimo.livro.titulo}
                          </td>

                          <td>
                            {emprestimo.leitor.nome}
                          </td>

                          <td>
                            {formatarData(
                              emprestimo.dataEmprestimo
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${emprestimo.status.toLowerCase()}`}
                            >
                              {emprestimo.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
