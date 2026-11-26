import { leitorRepository } from "../repositories/leitor.repository";
import { LeitorInput } from "@biblioteca/shared";

export const leitorService = {
  listar() {
    return leitorRepository.listar();
  },

  buscarPorId(id: number) {
    return leitorRepository.buscarPorId(id);
  },

  criar(data: LeitorInput) {
    return leitorRepository.criar(data);
  },

  atualizar(id: number, data: LeitorInput) {
    return leitorRepository.atualizar(id, data);
  },

  excluir(id: number) {
    return leitorRepository.excluir(id);
  },
};