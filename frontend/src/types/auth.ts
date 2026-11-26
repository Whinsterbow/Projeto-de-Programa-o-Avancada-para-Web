
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
}

export interface LoginResponse {
  mensagem: string;
  usuario: Usuario;
  token: string;
}

export interface CadastroResponse {
  mensagem: string;
  usuario: Usuario;
}
