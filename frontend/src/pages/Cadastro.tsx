
import { useState } from "react";
import type { FormEvent } from "react";

import axios from "axios";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { cadastroSchema } from "@biblioteca/shared";

import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth.service";

import AuthLayout from "../layouts/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  const { autenticado } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const resultado = cadastroSchema.safeParse({
      nome: nome.trim(),
      email: email.trim(),
      senha,
    });

    if (!resultado.success) {
      setErro(resultado.error.issues[0].message);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      await authService.cadastrar(resultado.data);

      navigate("/login", {
        replace: true,
        state: {
          mensagem: "Cadastro realizado com sucesso!",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErro(
          error.response?.data?.mensagem ||
            "Não foi possível realizar o cadastro."
        );
      } else {
        setErro("Erro inesperado.");
      }
    } finally {
      setCarregando(false);
    }
  }

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Preencha os dados para acessar o sistema."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="nome">Nome completo</label>

          <input
            id="nome"
            type="text"
            value={nome}
            autoComplete="name"
            placeholder="Informe seu nome"
            onChange={(event) =>
              setNome(event.target.value)
            }
          />
        </div>

        <div className="auth-field">
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="Informe seu e-mail"
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        <PasswordInput
          id="senha"
          label="Senha"
          value={senha}
          onChange={setSenha}
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirmarSenha"
          label="Confirmar senha"
          value={confirmarSenha}
          onChange={setConfirmarSenha}
          placeholder="Repita sua senha"
          autoComplete="new-password"
        />

        {erro && (
          <div className="auth-error" role="alert">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="auth-submit"
          disabled={carregando}
        >
          {carregando
            ? "Cadastrando..."
            : "Criar conta"}
        </button>
      </form>

      <div className="auth-link">
        Já possui uma conta?{" "}
        <Link to="/login">Fazer login</Link>
      </div>
    </AuthLayout>
  );
}
