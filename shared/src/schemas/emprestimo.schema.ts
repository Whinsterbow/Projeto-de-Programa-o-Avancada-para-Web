import { z } from "zod";

export const emprestimoSchema = z.object({
  livroId: z.number().int().positive(),
  leitorId: z.number().int().positive(),
  dataEmprestimo: z.string().date().optional(),
  dataDevolucao: z.string().date().nullable().optional(),
  status: z.enum([
    "Emprestado",
    "Devolvido",
    "Atrasado"
  ]).default("Emprestado"),
});

export type EmprestimoInput = z.infer<typeof emprestimoSchema>;