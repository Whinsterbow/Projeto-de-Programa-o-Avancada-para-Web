import { autorRepository } from "../repositories/autor.repository";
import { AutorInput } from "@biblioteca/shared";

export const autorService = {
  listar() {
    return autorRepository.listar();
  },

  buscarPorId(id: number) {
    return autorRepository.buscarPorId(id);
  },

  criar(data: AutorInput) {
    return autorRepository.criar({
      ...data,
      dataNascimento: data.dataNascimento
        ? new Date(data.dataNascimento)
        : null,
    });
  },

  atualizar(id: number, data: AutorInput) {
    return autorRepository.atualizar(id, {
      ...data,
      dataNascimento: data.dataNascimento
        ? new Date(data.dataNascimento)
        : null,
    });
  },

  excluir(id: number) {
    return autorRepository.excluir(id);
  },
};