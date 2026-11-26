
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { emprestimoSchema } from "@biblioteca/shared";

import type {
  Emprestimo,
  Livro,
  Leitor,
} from "../types/biblioteca";

import {
  emprestimoService,
  livroService,
  leitorService,
} from "../services/biblioteca.service";

import { obterMensagemErro } from "../services/erro.service";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";

import "../styles/crud.css";
import "../styles/livros.css";
import "../styles/emprestimos.css";

type StatusEmprestimo =
  | "Emprestado"
  | "Devolvido"
  | "Atrasado";

interface EmprestimoForm {
  livroId: string;
  leitorId: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  status: StatusEmprestimo;
}

function dataAtual() {
  const data = new Date();

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formularioInicial(): EmprestimoForm {
  return {
    livroId: "",
    leitorId: "",
    dataEmprestimo: dataAtual(),
    dataDevolucao: "",
    status: "Emprestado",
  };
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarData(
  data?: string | null
) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString(
    "pt-BR",
    { timeZone: "UTC" }
  );
}

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] =
    useState<Emprestimo[]>([]);

  const [livros, setLivros] =
    useState<Livro[]>([]);

  const [leitores, setLeitores] =
    useState<Leitor[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

  const [filtro, setFiltro] =
    useState("todos");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindo, setExcluindo] =
    useState(false);

  const [devolvendo, setDevolvendo] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [erroFormulario, setErroFormulario] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [modalAberto, setModalAberto] =
    useState(false);

  const [
    emprestimoEditando,
    setEmprestimoEditando,
  ] = useState<Emprestimo | null>(null);

  const [
    emprestimoExcluindo,
    setEmprestimoExcluindo,
  ] = useState<Emprestimo | null>(null);

  const [
    emprestimoDevolvendo,
    setEmprestimoDevolvendo,
  ] = useState<Emprestimo | null>(null);

  const [formulario, setFormulario] =
    useState<EmprestimoForm>(
      formularioInicial
    );

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        dadosEmprestimos,
        dadosLivros,
        dadosLeitores,
      ] = await Promise.all([
        emprestimoService.listar(),
        livroService.listar(),
        leitorService.listar(),
      ]);

      setEmprestimos(dadosEmprestimos);
      setLivros(dadosLivros);
      setLeitores(dadosLeitores);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os empréstimos."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const livrosDisponiveis = livros.filter(
    (livro) => livro.disponivel
  );

  const livrosSelecionaveis = livros.filter(
    (livro) =>
      livro.disponivel ||
      livro.id === emprestimoEditando?.livroId ||
      formulario.status === "Devolvido"
  );

  const totalEmprestados = emprestimos.filter(
    (item) => item.status === "Emprestado"
  ).length;

  const totalDevolvidos = emprestimos.filter(
    (item) => item.status === "Devolvido"
  ).length;

  const totalAtrasados = emprestimos.filter(
    (item) => item.status === "Atrasado"
  ).length;

  const emprestimosFiltrados =
    emprestimos.filter((item) => {
      const termo = normalizar(pesquisa);

      const correspondePesquisa =
        normalizar(
          item.livro?.titulo || ""
        ).includes(termo) ||
        normalizar(
          item.leitor?.nome || ""
        ).includes(termo) ||
        normalizar(
          item.status
        ).includes(termo);

      const correspondeFiltro =
        filtro === "todos" ||
        item.status === filtro;

      return (
        correspondePesquisa &&
        correspondeFiltro
      );
    });

  function abrirCadastro() {
    setEmprestimoEditando(null);
    setFormulario(formularioInicial());
    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(item: Emprestimo) {
    setEmprestimoEditando(item);

    setFormulario({
      livroId: String(item.livroId),
      leitorId: String(item.leitorId),

      dataEmprestimo:
        item.dataEmprestimo.slice(0, 10),

      dataDevolucao:
        item.dataDevolucao?.slice(0, 10) || "",

      status: item.status as StatusEmprestimo,
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEmprestimoEditando(null);
    setErroFormulario("");
  }

  function atualizarCampo<
    K extends keyof EmprestimoForm
  >(
    campo: K,
    valor: EmprestimoForm[K]
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function alterarStatus(
    status: StatusEmprestimo
  ) {
    setFormulario((anterior) => ({
      ...anterior,

      status,

      dataDevolucao:
        status === "Devolvido"
          ? anterior.dataDevolucao || dataAtual()
          : "",
    }));
  }

  async function salvarEmprestimo(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroFormulario("");

    if (!formulario.livroId) {
      setErroFormulario(
        "Selecione um livro."
      );

      return;
    }

    if (!formulario.leitorId) {
      setErroFormulario(
        "Selecione um leitor."
      );

      return;
    }

    if (!formulario.dataEmprestimo) {
      setErroFormulario(
        "Informe a data do empréstimo."
      );

      return;
    }

    if (
      formulario.status === "Devolvido" &&
      !formulario.dataDevolucao
    ) {
      setErroFormulario(
        "Informe a data da devolução."
      );

      return;
    }

    if (
      formulario.dataDevolucao &&
      formulario.dataDevolucao <
        formulario.dataEmprestimo
    ) {
      setErroFormulario(
        "A data de devolução não pode ser anterior à data do empréstimo."
      );

      return;
    }

    const resultado =
      emprestimoSchema.safeParse({
        livroId: Number(formulario.livroId),

        leitorId: Number(formulario.leitorId),

        dataEmprestimo:
          formulario.dataEmprestimo,

        dataDevolucao:
          formulario.status === "Devolvido"
            ? formulario.dataDevolucao
            : null,

        status: formulario.status,
      });

    if (!resultado.success) {
      setErroFormulario(
        resultado.error.issues[0].message
      );

      return;
    }

    try {
      setSalvando(true);

      if (emprestimoEditando) {
        await emprestimoService.atualizar(
          emprestimoEditando.id,
          resultado.data
        );

        setSucesso(
          "Empréstimo atualizado com sucesso!"
        );
      } else {
        await emprestimoService.criar(
          resultado.data
        );

        setSucesso(
          "Empréstimo cadastrado com sucesso!"
        );
      }

      setModalAberto(false);
      setEmprestimoEditando(null);

      await carregarDados();
    } catch (error) {
      setErroFormulario(
        obterMensagemErro(
          error,
          "Não foi possível salvar o empréstimo."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function solicitarDevolucao(
    item: Emprestimo
  ) {
    setErro("");
    setSucesso("");
    setEmprestimoDevolvendo(item);
  }

  async function registrarDevolucao() {
    if (!emprestimoDevolvendo) return;

    const resultado =
      emprestimoSchema.safeParse({
        livroId:
          emprestimoDevolvendo.livroId,

        leitorId:
          emprestimoDevolvendo.leitorId,

        dataEmprestimo:
          emprestimoDevolvendo
            .dataEmprestimo.slice(0, 10),

        dataDevolucao: dataAtual(),

        status: "Devolvido",
      });

    if (!resultado.success) {
      setErro(
        resultado.error.issues[0].message
      );

      setEmprestimoDevolvendo(null);

      return;
    }

    try {
      setDevolvendo(true);

      await emprestimoService.atualizar(
        emprestimoDevolvendo.id,
        resultado.data
      );

      setSucesso(
        "Devolução registrada com sucesso!"
      );

      setEmprestimoDevolvendo(null);

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível registrar a devolução."
        )
      );

      setEmprestimoDevolvendo(null);
    } finally {
      setDevolvendo(false);
    }
  }

  function solicitarExclusao(
    item: Emprestimo
  ) {
    setErro("");
    setSucesso("");
    setEmprestimoExcluindo(item);
  }

  async function excluirEmprestimo() {
    if (!emprestimoExcluindo) return;

    try {
      setExcluindo(true);

      await emprestimoService.excluir(
        emprestimoExcluindo.id
      );

      setSucesso(
        "Empréstimo excluído com sucesso!"
      );

      setEmprestimoExcluindo(null);

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o empréstimo."
        )
      );

      setEmprestimoExcluindo(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="crud-page">
      <div className="page-heading">
        <div>
          <h1>Empréstimos</h1>

          <p>
            Gerencie empréstimos e devoluções
            da biblioteca.
          </p>
        </div>

        <button
          className="button-primary"
          onClick={abrirCadastro}
          disabled={
            carregando ||
            livrosDisponiveis.length === 0 ||
            leitores.length === 0
          }
        >
          + Novo empréstimo
        </button>
      </div>

      {sucesso && (
        <div
          className="admin-success"
          role="status"
        >
          {sucesso}
        </div>
      )}

      {erro && (
        <div
          className="admin-error"
          role="alert"
        >
          {erro}
        </div>
      )}

      {!carregando &&
        !erro &&
        livrosDisponiveis.length === 0 && (
          <div className="admin-warning">
            Não existem livros disponíveis
            para novos empréstimos.
          </div>
        )}

      {!carregando &&
        !erro &&
        leitores.length === 0 && (
          <div className="admin-warning">
            Cadastre pelo menos um leitor
            antes de realizar empréstimos.
          </div>
        )}

      <div className="loan-summary">
        <div className="loan-summary-card">
          <span>Emprestados</span>

          <strong className="loan-total-blue">
            {totalEmprestados}
          </strong>
        </div>

        <div className="loan-summary-card">
          <span>Devolvidos</span>

          <strong className="loan-total-green">
            {totalDevolvidos}
          </strong>
        </div>

        <div className="loan-summary-card">
          <span>Atrasados</span>

          <strong className="loan-total-red">
            {totalAtrasados}
          </strong>
        </div>
      </div>

      <section className="content-card">
        <div className="crud-toolbar">
          <div className="livros-filtros">
            <SearchInput
              value={pesquisa}
              onChange={setPesquisa}
              placeholder="Pesquisar empréstimos..."
            />

            <select
              className="filter-select"
              aria-label="Filtrar status"
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value)
              }
            >
              <option value="todos">
                Todos os status
              </option>

              <option value="Emprestado">
                Emprestados
              </option>

              <option value="Devolvido">
                Devolvidos
              </option>

              <option value="Atrasado">
                Atrasados
              </option>
            </select>
          </div>

          <span className="record-count">
            {emprestimosFiltrados.length} de{" "}
            {emprestimos.length} registros
          </span>
        </div>

        {carregando ? (
          <div className="loading-state">
            Carregando empréstimos...
          </div>
        ) : emprestimosFiltrados.length === 0 ? (
          <div className="empty-state">
            {erro
              ? "Não foi possível exibir os registros."
              : pesquisa || filtro !== "todos"
              ? "Nenhum empréstimo encontrado."
              : "Nenhum empréstimo cadastrado."}

            {erro && (
              <div>
                <button
                  className="button-secondary"
                  onClick={carregarDados}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Livro</th>
                  <th>Leitor</th>
                  <th>Empréstimo</th>
                  <th>Devolução</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {emprestimosFiltrados.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        <strong>
                          {item.livro?.titulo || "—"}
                        </strong>
                      </td>

                      <td>
                        {item.leitor?.nome || "—"}
                      </td>

                      <td>
                        {formatarData(
                          item.dataEmprestimo
                        )}
                      </td>

                      <td>
                        {formatarData(
                          item.dataDevolucao
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            `loan-status loan-${item.status.toLowerCase()}`
                          }
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          {item.status !==
                            "Devolvido" && (
                            <button
                              className="button-return"
                              onClick={() =>
                                solicitarDevolucao(
                                  item
                                )
                              }
                            >
                              Devolver
                            </button>
                          )}

                          <button
                            className="button-edit"
                            onClick={() =>
                              abrirEdicao(item)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="button-delete"
                            onClick={() =>
                              solicitarExclusao(item)
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        titulo={
          emprestimoEditando
            ? "Editar empréstimo"
            : "Cadastrar empréstimo"
        }
        aberto={modalAberto}
        onClose={fecharModal}
        bloqueado={salvando}
      >
        <form
          className="crud-form"
          onSubmit={salvarEmprestimo}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="emprestimo-livro">
              Livro *
            </label>

            <select
              id="emprestimo-livro"
              value={formulario.livroId}
              onChange={(event) =>
                atualizarCampo(
                  "livroId",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione um livro
              </option>

              {livrosSelecionaveis.map(
                (livro) => (
                  <option
                    key={livro.id}
                    value={livro.id}
                  >
                    {livro.titulo}
                    {!livro.disponivel
                      ? " (Indisponível)"
                      : ""}
                  </option>
                )
              )}
            </select>

            <span className="field-hint">
              Novos empréstimos permitem
              selecionar somente livros disponíveis.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="emprestimo-leitor">
              Leitor *
            </label>

            <select
              id="emprestimo-leitor"
              value={formulario.leitorId}
              onChange={(event) =>
                atualizarCampo(
                  "leitorId",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione um leitor
              </option>

              {leitores.map((leitor) => (
                <option
                  key={leitor.id}
                  value={leitor.id}
                >
                  {leitor.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="emprestimo-data">
              Data do empréstimo *
            </label>

            <input
              id="emprestimo-data"
              type="date"
              value={formulario.dataEmprestimo}
              onChange={(event) =>
                atualizarCampo(
                  "dataEmprestimo",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="emprestimo-status">
              Status *
            </label>

            <select
              id="emprestimo-status"
              value={formulario.status}
              disabled={!emprestimoEditando}
              onChange={(event) =>
                alterarStatus(
                  event.target
                    .value as StatusEmprestimo
                )
              }
            >
              <option value="Emprestado">
                Emprestado
              </option>

              <option value="Devolvido">
                Devolvido
              </option>

              <option value="Atrasado">
                Atrasado
              </option>
            </select>
          </div>

          {formulario.status ===
            "Devolvido" && (
            <div className="form-field">
              <label htmlFor="emprestimo-devolucao">
                Data da devolução *
              </label>

              <input
                id="emprestimo-devolucao"
                type="date"
                min={formulario.dataEmprestimo}
                value={formulario.dataDevolucao}
                onChange={(event) =>
                  atualizarCampo(
                    "dataDevolucao",
                    event.target.value
                  )
                }
              />
            </div>
          )}

          <div className="loan-form-notice">
            A disponibilidade dos livros será
            atualizada automaticamente pelo
            sistema.
          </div>

          <p className="required-note">
            * Campo obrigatório
          </p>

          {erroFormulario && (
            <div
              className="admin-error"
              role="alert"
            >
              {erroFormulario}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={fecharModal}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="button-primary"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : emprestimoEditando
                ? "Salvar alterações"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        titulo="Registrar devolução"
        aberto={emprestimoDevolvendo !== null}
        bloqueado={devolvendo}
        onClose={() =>
          setEmprestimoDevolvendo(null)
        }
      >
        <div className="return-confirmation">
          <div className="return-icon">✓</div>

          <p>
            Deseja registrar a devolução do
            livro{" "}
            <strong>
              {emprestimoDevolvendo?.livro?.titulo}
            </strong>
            ?
          </p>

          <p>
            Leitor:{" "}
            <strong>
              {emprestimoDevolvendo?.leitor?.nome}
            </strong>
          </p>

          <p>
            Data da devolução:{" "}
            {formatarData(dataAtual())}
          </p>

          <p className="field-hint">
            O livro voltará a ficar disponível
            para novos empréstimos.
          </p>
        </div>

        <div className="form-actions">
          <button
            className="button-secondary"
            disabled={devolvendo}
            onClick={() =>
              setEmprestimoDevolvendo(null)
            }
          >
            Cancelar
          </button>

          <button
            className="button-confirm-return"
            disabled={devolvendo}
            onClick={registrarDevolucao}
          >
            {devolvendo
              ? "Registrando..."
              : "Confirmar devolução"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        aberto={emprestimoExcluindo !== null}
        titulo="Excluir empréstimo"
        mensagem={`Deseja realmente excluir o empréstimo do livro "${emprestimoExcluindo?.livro?.titulo || ""}"?`}
        carregando={excluindo}
        onConfirm={excluirEmprestimo}
        onCancel={() =>
          setEmprestimoExcluindo(null)
        }
      />
    </div>
  );
}
