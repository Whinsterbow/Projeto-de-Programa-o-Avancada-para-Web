import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const autorRepository = {
  listar() {
    return prisma.autor.findMany({
      orderBy: { nome: "asc" },
    });
  },

  buscarPorId(id: number) {
    return prisma.autor.findUnique({
      where: { id },
    });
  },

  criar(data: Prisma.AutorCreateInput) {
    return prisma.autor.create({ data });
  },

  atualizar(id: number, data: Prisma.AutorUpdateInput) {
    return prisma.autor.update({
      where: { id },
      data,
    });
  },

  excluir(id: number) {
    return prisma.autor.delete({
      where: { id },
    });
  },
};