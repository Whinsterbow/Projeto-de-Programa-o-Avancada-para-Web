
import axios from "axios";

interface RespostaErro {
  mensagem?: string;

  erros?: {
    formErrors?: string[];

    fieldErrors?: Record<
      string,
      string[] | undefined
    >;
  };
}

export function obterMensagemErro(
  error: unknown,
  mensagemPadrao = "Erro ao realizar operação."
): string {
  if (axios.isAxiosError<RespostaErro>(error)) {
    if (!error.response) {
      return "Não foi possível conectar à API.";
    }

    const dados = error.response.data;

    if (dados?.mensagem) {
      return dados.mensagem;
    }

    const errosCampos = Object.values(
      dados?.erros?.fieldErrors || {}
    ).flat();

    const primeiroErro =
      errosCampos.find(
        (mensagem): mensagem is string =>
          typeof mensagem === "string"
      ) || dados?.erros?.formErrors?.[0];

    if (primeiroErro) {
      return primeiroErro;
    }
  }

  return mensagemPadrao;
}
