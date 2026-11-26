import { z } from "zod";

export const leitorSchema = z.object({
  nome: z.string().min(3, "Informe o nome do leitor"),
  CPF: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

export type LeitorInput = z.infer<typeof leitorSchema>;