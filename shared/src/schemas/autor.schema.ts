import { z } from "zod";

export const autorSchema = z.object({
  nome: z.string().min(3, "Informe o nome do autor"),
  nacionalidade: z.string().optional(),
  dataNascimento: z.string().date().optional(),
});

export type AutorInput = z.infer<typeof autorSchema>;