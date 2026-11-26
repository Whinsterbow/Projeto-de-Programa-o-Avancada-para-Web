
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { leitorService } from "../services/leitor.service";
import { leitorSchema } from "@biblioteca/shared";

function tratarErro(error: unknown, res: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensagem: "Leitor não encontrado",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        mensagem: "CPF ou e-mail já cadastrado",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        mensagem: "Leitor possui empréstimos vinculados",
      });
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    if (
      error.message.includes('code: "23001"') &&
      error.message.includes("Emprestimo_leitorId_fkey")
    ) {
      return res.status(409).json({
        mensagem: "Leitor possui empréstimos vinculados",
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor",
  });
}

export const leitorController = {
  async listar(req: Request, res: Response) {
    try {
      const leitores = await leitorService.listar();
      return res.status(200).json(leitores);
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

      const leitor = await leitorService.buscarPorId(id);

      if (!leitor) {
        return res.status(404).json({
          mensagem: "Leitor não encontrado",
        });
      }

      return res.status(200).json(leitor);
    } catch (error) {
      return tratarErro(error, res);
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const resultado = leitorSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const leitor = await leitorService.criar(resultado.data);

      return res.status(201).json(leitor);
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

      const resultado = leitorSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          erros: resultado.error.flatten(),
        });
      }

      const leitor = await leitorService.atualizar(
        id,
        resultado.data
      );

      return res.status(200).json(leitor);
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

      await leitorService.excluir(id);

      return res.status(204).send();
    } catch (error) {
      return tratarErro(error, res);
    }
  },
};
