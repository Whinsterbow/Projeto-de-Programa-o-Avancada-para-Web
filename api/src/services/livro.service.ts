
import { LivroInput } from "@biblioteca/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { livroRepository } from "../repositories/livro.repository";

export class LivroError extends Error {
  constructor(
    mensagem: string,
    public statusCode: number
  ) {
    super(mensagem);
    this.name = "LivroError";
  }
}

export const livroService = {
  listar() {
    return livroRepository.listar();
  },

  buscarPorId(id: number) {
    return livroRepository.buscarPorId(id);
  },

  criar(data: LivroInput) {
    return livroRepository.criar(data);
  },

  async atualizar(id: number, data: LivroInput) {
    return prisma.$transaction(async (db) => {
      const livro = await db.livro.findUnique({
        where: { id },
      });

      if (!livro) {
        throw new LivroError(
          "Livro não encontrado",
          404
        );
      }

      const emprestimoAtivo = await db.emprestimo.findFirst({
        where: {
          livroId: id,
          status: {
            in: ["Emprestado", "Atrasado"],
          },
        },
      });

      if (emprestimoAtivo && data.disponivel) {
        throw new LivroError(
          "Não é possível disponibilizar um livro com empréstimo ativo",
          409
        );
      }

      return db.livro.update({
        where: { id },
        data,
        include: {
          autor: true,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  },

  excluir(id: number) {
    return livroRepository.excluir(id);
  },
};
