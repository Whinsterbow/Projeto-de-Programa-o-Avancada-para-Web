
import { useState } from "react";
import type { FormEvent } from "react";

import axios from "axios";

import {
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import { loginSchema } from "@biblioteca/shared";

import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const [sucesso, setSucesso] = useState(
    location.state?.mensagem || ""
  );

  const [carregando, setCarregando] =
    useState(false);

  const { login, autenticado } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const resultado = loginSchema.safeParse({
      email: email.trim(),
      senha,
    });

    if (!resultado.success) {
      setErro(resultado.error.issues[0].message);
      return;
    }

    try {
      setCarregando(true);

      await login(resultado.data);

      navigate("/", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErro(
          error.response?.data?.mensagem ||
            "Não foi possível realizar o login."
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
      titulo="Bem-vindo!"
      subtitulo="Entre para acessar sua biblioteca."
    >
      {sucesso && (
        <div className="auth-success" role="status">
          {sucesso}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
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
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="auth-link">
        Não possui uma conta?{" "}
        <Link to="/cadastro">Criar conta</Link>
      </div>
    </AuthLayout>
  );
}
