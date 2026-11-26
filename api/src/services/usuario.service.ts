
import bcrypt from "bcrypt";
import {
  CadastroInput,
  LoginInput,
} from "@biblioteca/shared";
import { usuarioRepository } from "../repositories/usuario.repository";

export class UsuarioError extends Error {
  constructor(
    mensagem: string,
    public statusCode: number
  ) {
    super(mensagem);
    this.name = "UsuarioError";
  }
}

export const usuarioService = {
  async cadastrar(data: CadastroInput) {
    const email = data.email.trim().toLowerCase();

    const usuarioExistente =
      await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      throw new UsuarioError(
        "E-mail já cadastrado",
        409
      );
    }

    if (Buffer.byteLength(data.senha, "utf8") > 72) {
      throw new UsuarioError(
        "A senha deve possuir no máximo 72 bytes",
        400
      );
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const usuario = await usuarioRepository.criar({
      nome: data.nome.trim(),
      email,
      senhaHash,
    });

    return usuario;
  },

  async login(data: LoginInput) {
    const email = data.email.trim().toLowerCase();

    const usuario =
      await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new UsuarioError(
        "E-mail ou senha incorretos",
        401
      );
    }

    if (Buffer.byteLength(data.senha, "utf8") > 72) {
      throw new UsuarioError(
        "E-mail ou senha incorretos",
        401
      );
    }

    const senhaValida = await bcrypt.compare(
      data.senha,
      usuario.senhaHash
    );

    if (!senhaValida) {
      throw new UsuarioError(
        "E-mail ou senha incorretos",
        401
      );
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criadoEm,
    };
  },
};
