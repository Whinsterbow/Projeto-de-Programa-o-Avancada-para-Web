
import api from "./api";

import type {
  Autor,
  Livro,
  Leitor,
  Emprestimo,
} from "../types/biblioteca";

import type {
  AutorInput,
  LivroInput,
  LeitorInput,
  EmprestimoInput,
} from "@biblioteca/shared";

function criarServico<T, Input>(rota: string) {
  return {
    async listar(): Promise<T[]> {
      const response = await api.get<T[]>(rota);
      return response.data;
    },

    async buscarPorId(id: number): Promise<T> {
      const response = await api.get<T>(
        `${rota}/${id}`
      );

      return response.data;
    },

    async criar(dados: Input): Promise<T> {
      const response = await api.post<T>(
        rota,
        dados
      );

      return response.data;
    },

    async atualizar(
      id: number,
      dados: Input
    ): Promise<T> {
      const response = await api.put<T>(
        `${rota}/${id}`,
        dados
      );

      return response.data;
    },

    async excluir(id: number): Promise<void> {
      await api.delete(`${rota}/${id}`);
    },
  };
}

export const autorService =
  criarServico<Autor, AutorInput>("/autores");

export const livroService =
  criarServico<Livro, LivroInput>("/livros");

export const leitorService =
  criarServico<Leitor, LeitorInput>("/leitores");

export const emprestimoService =
  criarServico<Emprestimo, EmprestimoInput>(
    "/emprestimos"
  );
