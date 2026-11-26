
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { autorSchema } from "@biblioteca/shared";

import type { Autor } from "../types/biblioteca";

import { autorService } from "../services/biblioteca.service";

import { obterMensagemErro } from "../services/erro.service";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";

import "../styles/crud.css";

interface AutorForm {
  nome: string;
  nacionalidade: string;
  dataNascimento: string;
}

const formularioInicial: AutorForm = {
  nome: "",
  nacionalidade: "",
  dataNascimento: "",
};

export default function Autores() {
  const [autores, setAutores] =
    useState<Autor[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

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

  const [autorEditando, setAutorEditando] =
    useState<Autor | null>(null);

  const [autorExcluindo, setAutorExcluindo] =
    useState<Autor | null>(null);

  const [formulario, setFormulario] =
    useState<AutorForm>(formularioInicial);

  async function carregarAutores() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await autorService.listar();

      setAutores(dados);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os autores."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAutores();
  }, []);

  function normalizar(texto: string) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const autoresFiltrados = autores.filter(
    (autor) => {
      const termo = normalizar(pesquisa);

      return (
        normalizar(autor.nome).includes(termo) ||
        normalizar(
          autor.nacionalidade || ""
        ).includes(termo)
      );
    }
  );

  function abrirCadastro() {
    setAutorEditando(null);
    setFormulario({ ...formularioInicial });
    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(autor: Autor) {
    setAutorEditando(autor);

    setFormulario({
      nome: autor.nome,
      nacionalidade: autor.nacionalidade || "",
      dataNascimento:
        autor.dataNascimento?.slice(0, 10) || "",
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setErroFormulario("");
    setAutorEditando(null);
  }

  function atualizarCampo(
    campo: keyof AutorForm,
    valor: string
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvarAutor(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroFormulario("");

    const resultado = autorSchema.safeParse({
      nome: formulario.nome.trim(),

      nacionalidade:
        formulario.nacionalidade.trim(),

      dataNascimento:
        formulario.dataNascimento || undefined,
    });

    if (!resultado.success) {
      setErroFormulario(
        resultado.error.issues[0].message
      );

      return;
    }

    try {
      setSalvando(true);

      if (autorEditando) {
        await autorService.atualizar(
          autorEditando.id,
          resultado.data
        );

        setSucesso(
          "Autor atualizado com sucesso!"
        );
      } else {
        await autorService.criar(resultado.data);

        setSucesso(
          "Autor cadastrado com sucesso!"
        );
      }

      setModalAberto(false);
      setAutorEditando(null);

      await carregarAutores();
    } catch (error) {
      setErroFormulario(
        obterMensagemErro(
          error,
          "Não foi possível salvar o autor."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function solicitarExclusao(autor: Autor) {
    setErro("");
    setSucesso("");
    setAutorExcluindo(autor);
  }

  async function excluirAutor() {
    if (!autorExcluindo) return;

    try {
      setExcluindo(true);

      await autorService.excluir(
        autorExcluindo.id
      );

      setSucesso(
        "Autor excluído com sucesso!"
      );

      setAutorExcluindo(null);

      await carregarAutores();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o autor."
        )
      );

      setAutorExcluindo(null);
    } finally {
      setExcluindo(false);
    }
  }

  function formatarData(data: string | null) {
    if (!data) return "—";

    return new Date(data).toLocaleDateString(
      "pt-BR",
      { timeZone: "UTC" }
    );
  }

  return (
    <div className="crud-page">
      <div className="page-heading">
        <div>
          <h1>Autores</h1>

          <p>
            Gerencie os autores da biblioteca.
          </p>
        </div>

        <button
          className="button-primary"
          onClick={abrirCadastro}
        >
          + Novo autor
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
        <div className="admin-error" role="alert">
          {erro}
        </div>
      )}

      <section className="content-card">
        <div className="crud-toolbar">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar autores..."
          />

          <span className="record-count">
            {autoresFiltrados.length} de{" "}
            {autores.length} registros
          </span>
        </div>

        {carregando ? (
          <div className="loading-state">
            Carregando autores...
          </div>
        ) : autoresFiltrados.length === 0 ? (
          <div className="empty-state">
            {erro
              ? "Não foi possível exibir os registros."
              : pesquisa
              ? "Nenhum autor encontrado."
              : "Nenhum autor cadastrado."}

            {erro && (
              <div>
                <button
                  className="button-secondary"
                  onClick={carregarAutores}
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
                  <th>Nome</th>
                  <th>Nacionalidade</th>
                  <th>Nascimento</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {autoresFiltrados.map((autor) => (
                  <tr key={autor.id}>
                    <td>{autor.id}</td>

                    <td>{autor.nome}</td>

                    <td>
                      {autor.nacionalidade || "—"}
                    </td>

                    <td>
                      {formatarData(
                        autor.dataNascimento
                      )}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="button-edit"
                          onClick={() =>
                            abrirEdicao(autor)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="button-delete"
                          onClick={() =>
                            solicitarExclusao(autor)
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
          autorEditando
            ? "Editar autor"
            : "Cadastrar autor"
        }
        aberto={modalAberto}
        onClose={fecharModal}
        bloqueado={salvando}
      >
        <form
          className="crud-form"
          onSubmit={salvarAutor}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="autor-nome">
              Nome completo *
            </label>

            <input
              id="autor-nome"
              type="text"
              value={formulario.nome}
              placeholder="Informe o nome do autor"
              onChange={(event) =>
                atualizarCampo(
                  "nome",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="autor-nacionalidade">
              Nacionalidade
            </label>

            <input
              id="autor-nacionalidade"
              type="text"
              value={formulario.nacionalidade}
              placeholder="Ex.: Brasileira"
              onChange={(event) =>
                atualizarCampo(
                  "nacionalidade",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="autor-nascimento">
              Data de nascimento
            </label>

            <input
              id="autor-nascimento"
              type="date"
              value={formulario.dataNascimento}
              onChange={(event) =>
                atualizarCampo(
                  "dataNascimento",
                  event.target.value
                )
              }
            />
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
                : autorEditando
                ? "Salvar alterações"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={autorExcluindo !== null}
        titulo="Excluir autor"
        mensagem={`Deseja realmente excluir o autor "${autorExcluindo?.nome || ""}"?`}
        carregando={excluindo}
        onConfirm={excluirAutor}
        onCancel={() =>
          setAutorExcluindo(null)
        }
      />
    </div>
  );
}
