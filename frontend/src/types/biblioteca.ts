
export interface Autor {
  id: number;
  nome: string;
  nacionalidade: string | null;
  dataNascimento: string | null;
}

export interface Livro {
  id: number;
  titulo: string;
  ISBN: string;
  anoPublicacao: number | null;
  disponivel: boolean;
  autorId: number;
  autor?: Autor;
}

export interface Leitor {
  id: number;
  nome: string;
  CPF: string;
  email: string;
  telefone: string | null;
}

export type StatusEmprestimo =
  | "Emprestado"
  | "Devolvido"
  | "Atrasado";

export interface Emprestimo {
  id: number;
  livroId: number;
  leitorId: number;
  dataEmprestimo: string;
  dataDevolucao: string | null;
  status: StatusEmprestimo;
  livro: Livro;
  leitor: Leitor;
}
