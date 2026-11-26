import { z } from "zod";

export const livroSchema = z.object({
  titulo: z.string().min(1, "Informe o título"),
  ISBN: z.string().regex(/^\d{13}$/, "ISBN deve ter 13 dígitos"),
  anoPublicacao: z.number().int().positive().optional(),
  disponivel: z.boolean().default(true),
  autorId: z.number().int().positive(),
});

export type LivroInput = z.infer<typeof livroSchema>;