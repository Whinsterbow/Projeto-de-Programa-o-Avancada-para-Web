
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import type { LoginInput } from "@biblioteca/shared";
import type { Usuario } from "../types/auth";

import { authService } from "../services/auth.service";

import {
  TOKEN_KEY,
  USUARIO_KEY,
} from "../services/api";

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  login: (dados: LoginInput) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<
  AuthContextData | undefined
>(undefined);

function recuperarUsuario(): Usuario | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    const usuarioSalvo =
      localStorage.getItem(USUARIO_KEY);

    if (!token || !usuarioSalvo) {
      return null;
    }

    return JSON.parse(usuarioSalvo) as Usuario;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [usuario, setUsuario] =
    useState<Usuario | null>(recuperarUsuario);

  async function login(dados: LoginInput) {
    const resposta = await authService.login(dados);

    localStorage.setItem(
      TOKEN_KEY,
      resposta.token
    );

    localStorage.setItem(
      USUARIO_KEY,
      JSON.stringify(resposta.usuario)
    );

    setUsuario(resposta.usuario);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);

    setUsuario(null);
  }

  useEffect(() => {
    function encerrarSessao() {
      setUsuario(null);
    }

    window.addEventListener(
      "biblioteca:logout",
      encerrarSessao
    );

    return () => {
      window.removeEventListener(
        "biblioteca:logout",
        encerrarSessao
      );
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: usuario !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return contexto;
}
