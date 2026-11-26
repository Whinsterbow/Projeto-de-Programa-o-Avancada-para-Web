import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const leitorRepository = {
  listar() {
    return prisma.leitor.findMany({
      orderBy: { nome: "asc" },
    });
  },

  buscarPorId(id: number) {
    return prisma.leitor.findUnique({
      where: { id },
    });
  },

  criar(data: Prisma.LeitorCreateInput) {
    return prisma.leitor.create({
      data,
    });
  },

  atualizar(id: number, data: Prisma.LeitorUpdateInput) {
    return prisma.leitor.update({
      where: { id },
      data,
    });
  },

  excluir(id: number) {
    return prisma.leitor.delete({
      where: { id },
    });
  },
};