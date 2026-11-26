
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { emprestimoRepository } from "../repositories/emprestimo.repository";
import { EmprestimoInput } from "@biblioteca/shared";

export class EmprestimoError extends Error {
  constructor(
    mensagem: string,
    public statusCode: number
  ) {
    super(mensagem);
    this.name = "EmprestimoError";
  }
}

export const emprestimoService = {
  listar() {
    return emprestimoRepository.listar();
  },

  buscarPorId(id: number) {
    return emprestimoRepository.buscarPorId(id);
  },

  async criar(data: EmprestimoInput) {
    return prisma.$transaction(async (db) => {
      const livro = await db.livro.findUnique({
        where: { id: data.livroId },
      });

      if (!livro) {
        throw new EmprestimoError(
          "Livro não encontrado",
          404
        );
      }

      const leitor = await db.leitor.findUnique({
        where: { id: data.leitorId },
      });

      if (!leitor) {
        throw new EmprestimoError(
          "Leitor não encontrado",
          404
        );
      }

      if (!livro.disponivel) {
        throw new EmprestimoError(
          "Livro indisponível para empréstimo",
          409
        );
      }

      const dataEmprestimo = data.dataEmprestimo
        ? new Date(data.dataEmprestimo)
        : new Date();

      const dataDevolucao = data.dataDevolucao
        ? new Date(data.dataDevolucao)
        : null;

      if (data.status !== "Emprestado" || dataDevolucao) {
        throw new EmprestimoError(
          "Um novo empréstimo deve iniciar com status Emprestado e sem data de devolução",
          400
        );
      }

      await db.livro.update({
        where: { id: data.livroId },
        data: { disponivel: false },
      });

      return emprestimoRepository.criar(
        {
          livroId: data.livroId,
          leitorId: data.leitorId,
          dataEmprestimo,
          dataDevolucao,
          status: data.status,
        },
        db
      );
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  },

  async atualizar(id: number, data: EmprestimoInput) {
    return prisma.$transaction(async (db) => {
      const emprestimo = await db.emprestimo.findUnique({
        where: { id },
      });

      if (!emprestimo) {
        throw new EmprestimoError(
          "Empréstimo não encontrado",
          404
        );
      }

      const livro = await db.livro.findUnique({
        where: { id: data.livroId },
      });

      if (!livro) {
        throw new EmprestimoError(
          "Livro não encontrado",
          404
        );
      }

      const leitor = await db.leitor.findUnique({
        where: { id: data.leitorId },
      });

      if (!leitor) {
        throw new EmprestimoError(
          "Leitor não encontrado",
          404
        );
      }

      const estavaAtivo =
        emprestimo.status !== "Devolvido";

      const continuaAtivo =
        data.status !== "Devolvido";

      const mudouLivro =
        emprestimo.livroId !== data.livroId;

      const dataEmprestimo = data.dataEmprestimo
        ? new Date(data.dataEmprestimo)
        : emprestimo.dataEmprestimo;

      let dataDevolucao: Date | null = null;

      if (data.status === "Devolvido") {
        dataDevolucao = data.dataDevolucao
          ? new Date(data.dataDevolucao)
          : emprestimo.dataDevolucao || new Date();
      } else if (data.dataDevolucao) {
        throw new EmprestimoError(
          "Empréstimos ativos não podem possuir data de devolução",
          400
        );
      }

      if (
        dataDevolucao &&
        dataDevolucao.toISOString().slice(0, 10) <
          dataEmprestimo.toISOString().slice(0, 10)
      ) {
        throw new EmprestimoError(
          "A data de devolução não pode ser anterior à data do empréstimo",
          400
        );
      }

      if (
        continuaAtivo &&
        (mudouLivro || !estavaAtivo)
      ) {
        if (!livro.disponivel) {
          throw new EmprestimoError(
            "Livro indisponível para empréstimo",
            409
          );
        }
      }

      if (
        estavaAtivo &&
        (mudouLivro || !continuaAtivo)
      ) {
        await db.livro.update({
          where: { id: emprestimo.livroId },
          data: { disponivel: true },
        });
      }

      if (continuaAtivo) {
        await db.livro.update({
          where: { id: data.livroId },
          data: { disponivel: false },
        });
      }

      return emprestimoRepository.atualizar(
        id,
        {
          livroId: data.livroId,
          leitorId: data.leitorId,
          dataEmprestimo,
          dataDevolucao,
          status: data.status,
        },
        db
      );
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  },

  async excluir(id: number) {
    return prisma.$transaction(async (db) => {
      const emprestimo = await db.emprestimo.findUnique({
        where: { id },
      });

      if (!emprestimo) {
        throw new EmprestimoError(
          "Empréstimo não encontrado",
          404
        );
      }

      await emprestimoRepository.excluir(id, db);

      if (emprestimo.status !== "Devolvido") {
        await db.livro.update({
          where: { id: emprestimo.livroId },
          data: { disponivel: true },
        });
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  },
};
