
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const emprestimoRepository = {
  listar() {
    return prisma.emprestimo.findMany({
      include: {
        livro: true,
        leitor: true,
      },
      orderBy: {
        dataEmprestimo: "desc",
      },
    });
  },

  buscarPorId(id: number) {
    return prisma.emprestimo.findUnique({
      where: { id },
      include: {
        livro: true,
        leitor: true,
      },
    });
  },

  criar(
    data: Prisma.EmprestimoUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.emprestimo.create({
      data,
      include: {
        livro: true,
        leitor: true,
      },
    });
  },

  atualizar(
    id: number,
    data: Prisma.EmprestimoUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.emprestimo.update({
      where: { id },
      data,
      include: {
        livro: true,
        leitor: true,
      },
    });
  },

  excluir(
    id: number,
    db: Prisma.TransactionClient = prisma
  ) {
    return db.emprestimo.delete({
      where: { id },
    });
  },
};
