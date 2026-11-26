
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  livroService,
  LivroError,
} from "../services/livro.service";
import { livroSchema } from "@biblioteca/shared";

function tratarErro(error: unknown, res: Response) {
  if (error instanceof LivroError) {
    return res.status(error.statusCode).json({
      mensagem: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensagem: "Livro não encontrado",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        mensagem: "ISBN já cadastrado",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        mensagem: "Autor inexistente ou livro com empréstimos vinculados",
      });
    }

    if (error.code === "P2034") {
      return res.status(409).json({
        mensagem: "Conflito de operação. Tente novamente",
      });
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    if (
      error.message.includes('code: "23001"') &&
      error.message.includes("Emprestimo_livroId_fkey")
    ) {
      return res.status(409).json({
        mensagem: "Livro possui empréstimos vinculados",
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor",
  });
}

export const livroController = {
  async listar(req: Request, res: Response) {
    try {
      const livros = await livroService.listar();

      return res.status(200).json(livros);
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

      const livro = await livroService.buscarPorId(id);

      if (!livro) {
        return res.status(404).json({
          mensagem: "Livro não encontrado",
        });
      }

      return res.status(200).json(livro);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const resultado = livroSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const livro = await livroService.criar(resultado.data);

      return res.status(201).json(livro);
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

      const resultado = livroSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const livro = await livroService.atualizar(
        id,
        resultado.data
      );

      return res.status(200).json(livro);
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

      await livroService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return tratarErro(error, res);
    }
  },
};
