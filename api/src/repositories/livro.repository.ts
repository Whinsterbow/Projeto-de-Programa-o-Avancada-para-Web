import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const livroRepository = {
  listar() {
    return prisma.livro.findMany({
      include: { autor: true },
      orderBy: { titulo: "asc" },
    });
  },

  buscarPorId(id: number) {
    return prisma.livro.findUnique({
      where: { id },
      include: { autor: true },
    });
  },

  criar(data: Prisma.LivroUncheckedCreateInput) {
    return prisma.livro.create({
      data,
      include: { autor: true },
    });
  },

  atualizar(id: number, data: Prisma.LivroUncheckedUpdateInput) {
    return prisma.livro.update({
      where: { id },
      data,
      include: { autor: true },
    });
  },

  excluir(id: number) {
    return prisma.livro.delete({
      where: { id },
    });
  },
};