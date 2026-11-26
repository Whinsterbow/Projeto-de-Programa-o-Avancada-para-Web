
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { autorService } from "../services/autor.service";
import { autorSchema } from "@biblioteca/shared";

function tratarErro(error: unknown, res: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensagem: "Autor não encontrado",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        mensagem: "Autor possui livros vinculados",
      });
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    if (
      error.message.includes('code: "23001"') &&
      error.message.includes("Livro_autorId_fkey")
    ) {
      return res.status(409).json({
        mensagem: "Autor possui livros vinculados",
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor",
  });
}

export const autorController = {
  async listar(req: Request, res: Response) {
    try {
      const autores = await autorService.listar();
      return res.status(200).json(autores);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          mensagem: "ID inválido",
        });
      }

      const autor = await autorService.buscarPorId(id);

      if (!autor) {
        return res.status(404).json({
          mensagem: "Autor não encontrado",
        });
      }

      return res.status(200).json(autor);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const resultado = autorSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const autor = await autorService.criar(resultado.data);

      return res.status(201).json(autor);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          mensagem: "ID inválido",
        });
      }

      const resultado = autorSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const autor = await autorService.atualizar(
        id,
        resultado.data
      );

      return res.status(200).json(autor);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          mensagem: "ID inválido",
        });
      }

      await autorService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return tratarErro(error, res);
    }
  },
};
