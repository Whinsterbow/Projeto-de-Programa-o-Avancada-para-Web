
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { livroSchema } from "@biblioteca/shared";

import type {
  Livro,
  Autor,
} from "../types/biblioteca";

import {
  livroService,
  autorService,
} from "../services/biblioteca.service";

import { obterMensagemErro } from "../services/erro.service";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";

import "../styles/crud.css";
import "../styles/livros.css";

interface LivroForm {
  titulo: string;
  ISBN: string;
  anoPublicacao: string;
  autorId: string;
  disponivel: boolean;
}

const formularioInicial: LivroForm = {
  titulo: "",
  ISBN: "",
  anoPublicacao: "",
  autorId: "",
  disponivel: true,
};

type FiltroDisponibilidade =
  | "todos"
  | "disponiveis"
  | "indisponiveis";

export default function Livros() {
  const [livros, setLivros] =
    useState<Livro[]>([]);

  const [autores, setAutores] =
    useState<Autor[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

  const [filtro, setFiltro] =
    useState<FiltroDisponibilidade>("todos");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindo, setExcluindo] =
    useState(false);

  const [erro, setErro] = useState("");

  const [erroFormulario, setErroFormulario] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [modalAberto, setModalAberto] =
    useState(false);

  const [livroEditando, setLivroEditando] =
    useState<Livro | null>(null);

  const [livroExcluindo, setLivroExcluindo] =
    useState<Livro | null>(null);

  const [formulario, setFormulario] =
    useState<LivroForm>(formularioInicial);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [dadosLivros, dadosAutores] =
        await Promise.all([
          livroService.listar(),
          autorService.listar(),
        ]);

      setLivros(dadosLivros);
      setAutores(dadosAutores);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os livros."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function normalizar(texto: string) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const livrosFiltrados = livros.filter(
    (livro) => {
      const termo = normalizar(pesquisa);

      const correspondePesquisa =
        normalizar(livro.titulo).includes(termo) ||
        livro.ISBN.includes(termo) ||
        normalizar(
          livro.autor?.nome || ""
        ).includes(termo);

      const correspondeFiltro =
        filtro === "todos" ||
        (filtro === "disponiveis" &&
          livro.disponivel) ||
        (filtro === "indisponiveis" &&
          !livro.disponivel);

      return (
        correspondePesquisa &&
        correspondeFiltro
      );
    }
  );

  function abrirCadastro() {
    setLivroEditando(null);

    setFormulario({
      ...formularioInicial,
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(livro: Livro) {
    setLivroEditando(livro);

    setFormulario({
      titulo: livro.titulo,
      ISBN: livro.ISBN,

      anoPublicacao:
        livro.anoPublicacao?.toString() || "",

      autorId: livro.autorId.toString(),

      disponivel: livro.disponivel,
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setLivroEditando(null);
    setErroFormulario("");
  }

  function atualizarCampo<
    K extends keyof LivroForm
  >(
    campo: K,
    valor: LivroForm[K]
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvarLivro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroFormulario("");

    if (!formulario.autorId) {
      setErroFormulario(
        "Selecione um autor."
      );

      return;
    }

    const resultado = livroSchema.safeParse({
      titulo: formulario.titulo.trim(),

      ISBN: formulario.ISBN.trim(),

      anoPublicacao:
        formulario.anoPublicacao !== ""
          ? Number(formulario.anoPublicacao)
          : undefined,

      autorId: Number(formulario.autorId),

      disponivel: formulario.disponivel,
    });

    if (!resultado.success) {
      setErroFormulario(
        resultado.error.issues[0].message
      );

      return;
    }

    try {
      setSalvando(true);

      if (livroEditando) {
        await livroService.atualizar(
          livroEditando.id,
          resultado.data
        );

        setSucesso(
          "Livro atualizado com sucesso!"
        );
      } else {
        await livroService.criar(
          resultado.data
        );

        setSucesso(
          "Livro cadastrado com sucesso!"
        );
      }

      setModalAberto(false);
      setLivroEditando(null);

      await carregarDados();
    } catch (error) {
      setErroFormulario(
        obterMensagemErro(
          error,
          "Não foi possível salvar o livro."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function solicitarExclusao(livro: Livro) {
    setErro("");
    setSucesso("");
    setLivroExcluindo(livro);
  }

  async function excluirLivro() {
    if (!livroExcluindo) return;

    try {
      setExcluindo(true);

      await livroService.excluir(
        livroExcluindo.id
      );

      setSucesso(
        "Livro excluído com sucesso!"
      );

      setLivroExcluindo(null);

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o livro."
        )
      );

      setLivroExcluindo(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="crud-page">
      <div className="page-heading">
        <div>
          <h1>Livros</h1>

          <p>
            Gerencie o acervo da biblioteca.
          </p>
        </div>

        <button
          className="button-primary"
          onClick={abrirCadastro}
          disabled={
            carregando || autores.length === 0
          }
        >
          + Novo livro
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
        autores.length === 0 && (
          <div className="admin-warning">
            Cadastre pelo menos um autor
            antes de cadastrar livros.
          </div>
        )}

      <section className="content-card">
        <div className="crud-toolbar">
          <div className="livros-filtros">
            <SearchInput
              value={pesquisa}
              onChange={setPesquisa}
              placeholder="Pesquisar livros..."
            />

            <select
              className="filter-select"
              aria-label="Filtrar disponibilidade"
              value={filtro}
              onChange={(event) =>
                setFiltro(
                  event.target
                    .value as FiltroDisponibilidade
                )
              }
            >
              <option value="todos">
                Todos os status
              </option>

              <option value="disponiveis">
                Disponíveis
              </option>

              <option value="indisponiveis">
                Indisponíveis
              </option>
            </select>
          </div>

          <span className="record-count">
            {livrosFiltrados.length} de{" "}
            {livros.length} registros
          </span>
        </div>

        {carregando ? (
          <div className="loading-state">
            Carregando livros...
          </div>
        ) : livrosFiltrados.length === 0 ? (
          <div className="empty-state">
            {erro
              ? "Não foi possível exibir os registros."
              : pesquisa || filtro !== "todos"
              ? "Nenhum livro encontrado."
              : "Nenhum livro cadastrado."}

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
                  <th>Título / ISBN</th>
                  <th>Autor</th>
                  <th>Ano</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {livrosFiltrados.map((livro) => (
                  <tr key={livro.id}>
                    <td>{livro.id}</td>

                    <td>
                      <div className="book-info">
                        <strong>
                          {livro.titulo}
                        </strong>

                        <span>
                          ISBN: {livro.ISBN}
                        </span>
                      </div>
                    </td>

                    <td>
                      {livro.autor?.nome || "—"}
                    </td>

                    <td>
                      {livro.anoPublicacao ?? "—"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          livro.disponivel
                            ? "status-disponivel"
                            : "status-indisponivel"
                        }`}
                      >
                        {livro.disponivel
                          ? "Disponível"
                          : "Indisponível"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="button-edit"
                          onClick={() =>
                            abrirEdicao(livro)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="button-delete"
                          onClick={() =>
                            solicitarExclusao(livro)
                          }
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        titulo={
          livroEditando
            ? "Editar livro"
            : "Cadastrar livro"
        }
        aberto={modalAberto}
        onClose={fecharModal}
        bloqueado={salvando}
      >
        <form
          className="crud-form"
          onSubmit={salvarLivro}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="livro-titulo">
              Título *
            </label>

            <input
              id="livro-titulo"
              type="text"
              value={formulario.titulo}
              placeholder="Informe o título do livro"
              onChange={(event) =>
                atualizarCampo(
                  "titulo",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="livro-isbn">
              ISBN *
            </label>

            <input
              id="livro-isbn"
              type="text"
              inputMode="numeric"
              maxLength={13}
              value={formulario.ISBN}
              placeholder="Informe os 13 dígitos"
              onChange={(event) =>
                atualizarCampo(
                  "ISBN",
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

            <span className="field-hint">
              Informe somente os 13 números do ISBN.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="livro-autor">
              Autor *
            </label>

            <select
              id="livro-autor"
              value={formulario.autorId}
              onChange={(event) =>
                atualizarCampo(
                  "autorId",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione um autor
              </option>

              {autores.map((autor) => (
                <option
                  key={autor.id}
                  value={autor.id}
                >
                  {autor.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="livro-ano">
              Ano de publicação
            </label>

            <input
              id="livro-ano"
              type="number"
              min="1"
              step="1"
              value={formulario.anoPublicacao}
              placeholder="Ex.: 1899"
              onChange={(event) =>
                atualizarCampo(
                  "anoPublicacao",
                  event.target.value
                )
              }
            />
          </div>

          <div className="availability-field">
            <label
              className="checkbox-field"
              htmlFor="livro-disponivel"
            >
              <input
                id="livro-disponivel"
                type="checkbox"
                checked={formulario.disponivel}
                onChange={(event) =>
                  atualizarCampo(
                    "disponivel",
                    event.target.checked
                  )
                }
              />

              Disponível para empréstimo
            </label>

            <p className="field-hint">
              Livros com empréstimos ativos não
              podem ser disponibilizados
              manualmente.
            </p>
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
                : livroEditando
                ? "Salvar alterações"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={livroExcluindo !== null}
        titulo="Excluir livro"
        mensagem={`Deseja realmente excluir o livro "${livroExcluindo?.titulo || ""}"?`}
        carregando={excluindo}
        onConfirm={excluirLivro}
        onCancel={() =>
          setLivroExcluindo(null)
        }
      />
    </div>
  );
}
