
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  emprestimoService,
  EmprestimoError,
} from "../services/emprestimo.service";
import { emprestimoSchema } from "@biblioteca/shared";

function tratarErro(error: unknown, res: Response) {
  if (error instanceof EmprestimoError) {
    return res.status(error.statusCode).json({
      mensagem: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensagem: "Registro não encontrado",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        mensagem: "Livro ou leitor inválido",
      });
    }

    if (error.code === "P2034") {
      return res.status(409).json({
        mensagem: "Conflito de operação. Tente novamente",
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor",
  });
}

export const emprestimoController = {
  async listar(req: Request, res: Response) {
    try {
      const emprestimos = await emprestimoService.listar();

      return res.status(200).json(emprestimos);
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

      const emprestimo =
        await emprestimoService.buscarPorId(id);

      if (!emprestimo) {
        return res.status(404).json({
          mensagem: "Empréstimo não encontrado",
        });
      }

      return res.status(200).json(emprestimo);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const resultado = emprestimoSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const emprestimo = await emprestimoService.criar(
        resultado.data
      );

      return res.status(201).json(emprestimo);
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

      const resultado = emprestimoSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const emprestimo = await emprestimoService.atualizar(
        id,
        resultado.data
      );

      return res.status(200).json(emprestimo);
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

      await emprestimoService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return tratarErro(error, res);
    }
  },
};
