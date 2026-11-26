
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const usuarioRepository = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
    });
  },

  buscarPorId(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });
  },

  criar(data: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });
  },
};
