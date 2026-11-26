
import api from "./api";

import type {
  LoginInput,
  CadastroInput,
} from "@biblioteca/shared";

import type {
  LoginResponse,
  CadastroResponse,
} from "../types/auth";

export const authService = {
  async login(
    dados: LoginInput
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/usuarios/login",
      dados
    );

    return response.data;
  },

  async cadastrar(
    dados: CadastroInput
  ): Promise<CadastroResponse> {
    const response = await api.post<CadastroResponse>(
      "/usuarios/cadastro",
      dados
    );

    return response.data;
  },
};
