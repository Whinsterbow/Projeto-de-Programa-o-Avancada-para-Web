
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { leitorSchema } from "@biblioteca/shared";

import type { Leitor } from "../types/biblioteca";

import { leitorService } from "../services/biblioteca.service";

import { obterMensagemErro } from "../services/erro.service";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchInput from "../components/SearchInput";

import "../styles/crud.css";
import "../styles/leitores.css";

interface LeitorForm {
  nome: string;
  CPF: string;
  email: string;
  telefone: string;
}

const formularioInicial: LeitorForm = {
  nome: "",
  CPF: "",
  email: "",
  telefone: "",
};

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function formatarCPF(valor: string) {
  return somenteNumeros(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor: string) {
  const numeros = somenteNumeros(valor)
    .slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return numeros.replace(
      /^(\d{2})(\d+)/,
      "($1) $2"
    );
  }

  if (numeros.length <= 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d+)/,
      "($1) $2-$3"
    );
  }

  return numeros.replace(
    /^(\d{2})(\d{5})(\d{4})$/,
    "($1) $2-$3"
  );
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Leitores() {
  const [leitores, setLeitores] =
    useState<Leitor[]>([]);

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

  const [leitorEditando, setLeitorEditando] =
    useState<Leitor | null>(null);

  const [leitorExcluindo, setLeitorExcluindo] =
    useState<Leitor | null>(null);

  const [formulario, setFormulario] =
    useState<LeitorForm>(formularioInicial);

  async function carregarLeitores() {
    try {
      setCarregando(true);
      setErro("");

      const dados =
        await leitorService.listar();

      setLeitores(dados);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os leitores."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLeitores();
  }, []);

  const leitoresFiltrados = leitores.filter(
    (leitor) => {
      const termo = normalizar(pesquisa);

      const termoNumerico =
        somenteNumeros(termo);

      const correspondeTexto =
        normalizar(leitor.nome).includes(termo) ||
        normalizar(leitor.email).includes(termo);

      const correspondeNumero =
        termoNumerico.length > 0 &&
        /^[\d\s().-]+$/.test(termo) &&
        (
          somenteNumeros(leitor.CPF).includes(
            termoNumerico
          ) ||
          somenteNumeros(
            leitor.telefone || ""
          ).includes(termoNumerico)
        );

      return (
        correspondeTexto ||
        correspondeNumero
      );
    }
  );

  function abrirCadastro() {
    setLeitorEditando(null);

    setFormulario({
      ...formularioInicial,
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(leitor: Leitor) {
    setLeitorEditando(leitor);

    setFormulario({
      nome: leitor.nome,
      CPF: leitor.CPF,
      email: leitor.email,
      telefone: leitor.telefone || "",
    });

    setErroFormulario("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setLeitorEditando(null);
    setErroFormulario("");
  }

  function atualizarCampo(
    campo: keyof LeitorForm,
    valor: string
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvarLeitor(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroFormulario("");

    const telefone = somenteNumeros(
      formulario.telefone
    );

    const resultado = leitorSchema.safeParse({
      nome: formulario.nome.trim(),

      CPF: somenteNumeros(formulario.CPF),

      email: formulario.email
        .trim()
        .toLowerCase(),

      telefone,
    });

    if (!resultado.success) {
      setErroFormulario(
        resultado.error.issues[0].message
      );

      return;
    }

    if (
      telefone.length > 0 &&
      telefone.length !== 10 &&
      telefone.length !== 11
    ) {
      setErroFormulario(
        "Informe um telefone com 10 ou 11 dígitos."
      );

      return;
    }

    try {
      setSalvando(true);

      if (leitorEditando) {
        await leitorService.atualizar(
          leitorEditando.id,
          resultado.data
        );

        setSucesso(
          "Leitor atualizado com sucesso!"
        );
      } else {
        await leitorService.criar(
          resultado.data
        );

        setSucesso(
          "Leitor cadastrado com sucesso!"
        );
      }

      setModalAberto(false);
      setLeitorEditando(null);

      await carregarLeitores();
    } catch (error) {
      setErroFormulario(
        obterMensagemErro(
          error,
          "Não foi possível salvar o leitor."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function solicitarExclusao(leitor: Leitor) {
    setErro("");
    setSucesso("");
    setLeitorExcluindo(leitor);
  }

  async function excluirLeitor() {
    if (!leitorExcluindo) return;

    try {
      setExcluindo(true);

      await leitorService.excluir(
        leitorExcluindo.id
      );

      setSucesso(
        "Leitor excluído com sucesso!"
      );

      setLeitorExcluindo(null);

      await carregarLeitores();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível excluir o leitor."
        )
      );

      setLeitorExcluindo(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="crud-page">
      <div className="page-heading">
        <div>
          <h1>Leitores</h1>

          <p>
            Gerencie os leitores cadastrados
            na biblioteca.
          </p>
        </div>

        <button
          className="button-primary"
          onClick={abrirCadastro}
        >
          + Novo leitor
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

      <section className="content-card">
        <div className="crud-toolbar">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar leitores..."
          />

          <span className="record-count">
            {leitoresFiltrados.length} de{" "}
            {leitores.length} registros
          </span>
        </div>

        {carregando ? (
          <div className="loading-state">
            Carregando leitores...
          </div>
        ) : leitoresFiltrados.length === 0 ? (
          <div className="empty-state">
            {erro
              ? "Não foi possível exibir os registros."
              : pesquisa
              ? "Nenhum leitor encontrado."
              : "Nenhum leitor cadastrado."}

            {erro && (
              <div>
                <button
                  className="button-secondary"
                  onClick={carregarLeitores}
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
                  <th>CPF</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {leitoresFiltrados.map((leitor) => (
                  <tr key={leitor.id}>
                    <td>{leitor.id}</td>

                    <td>
                      <div className="reader-info">
                        <div className="reader-avatar">
                          {leitor.nome
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {leitor.nome}
                        </strong>
                      </div>
                    </td>

                    <td className="reader-cpf">
                      {formatarCPF(leitor.CPF)}
                    </td>

                    <td>
                      <div className="reader-contact">
                        <span>
                          {leitor.email}
                        </span>

                        <small>
                          {leitor.telefone
                            ? formatarTelefone(
                                leitor.telefone
                              )
                            : "Sem telefone"}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="button-edit"
                          onClick={() =>
                            abrirEdicao(leitor)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="button-delete"
                          onClick={() =>
                            solicitarExclusao(leitor)
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
          leitorEditando
            ? "Editar leitor"
            : "Cadastrar leitor"
        }
        aberto={modalAberto}
        onClose={fecharModal}
        bloqueado={salvando}
      >
        <form
          className="crud-form"
          onSubmit={salvarLeitor}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="leitor-nome">
              Nome completo *
            </label>

            <input
              id="leitor-nome"
              type="text"
              autoComplete="off"
              value={formulario.nome}
              placeholder="Informe o nome do leitor"
              onChange={(event) =>
                atualizarCampo(
                  "nome",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="leitor-cpf">
              CPF *
            </label>

            <input
              id="leitor-cpf"
              type="text"
              inputMode="numeric"
              maxLength={14}
              value={formatarCPF(formulario.CPF)}
              placeholder="000.000.000-00"
              onChange={(event) =>
                atualizarCampo(
                  "CPF",
                  somenteNumeros(
                    event.target.value
                  ).slice(0, 11)
                )
              }
            />

            <span className="field-hint">
              Informe os 11 dígitos do CPF.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="leitor-email">
              E-mail *
            </label>

            <input
              id="leitor-email"
              type="email"
              value={formulario.email}
              placeholder="exemplo@email.com"
              onChange={(event) =>
                atualizarCampo(
                  "email",
                  event.target.value
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="leitor-telefone">
              Telefone
            </label>

            <input
              id="leitor-telefone"
              type="tel"
              inputMode="tel"
              maxLength={15}
              value={formatarTelefone(
                formulario.telefone
              )}
              placeholder="(00) 00000-0000"
              onChange={(event) =>
                atualizarCampo(
                  "telefone",
                  somenteNumeros(
                    event.target.value
                  ).slice(0, 11)
                )
              }
            />

            <span className="field-hint">
              Informe o DDD e o número do telefone.
            </span>
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
                : leitorEditando
                ? "Salvar alterações"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={leitorExcluindo !== null}
        titulo="Excluir leitor"
        mensagem={`Deseja realmente excluir o leitor "${leitorExcluindo?.nome || ""}"?`}
        carregando={excluindo}
        onConfirm={excluirLeitor}
        onCancel={() =>
          setLeitorExcluindo(null)
        }
      />
    </div>
  );
}
