
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  usuarioService,
  UsuarioError,
} from "../services/usuario.service";
import {
  cadastroSchema,
  loginSchema,
} from "@biblioteca/shared";
import { gerarToken } from "../config/jwt";

function tratarErro(error: unknown, res: Response) {
  if (error instanceof UsuarioError) {
    return res.status(error.statusCode).json({
      mensagem: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        mensagem: "E-mail já cadastrado",
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor",
  });
}

export const usuarioController = {
  async cadastrar(req: Request, res: Response) {
    try {
      const resultado = cadastroSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const usuario = await usuarioService.cadastrar(
        resultado.data
      );

      return res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso",
        usuario,
      });
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const resultado = loginSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const usuario = await usuarioService.login(
        resultado.data
      );

      const token = gerarToken(usuario.id);

      return res.status(200).json({
        mensagem: "Login realizado com sucesso",
        usuario,
        token,
      });
    } catch (error) {
      return tratarErro(error, res);
    }
  },
};
