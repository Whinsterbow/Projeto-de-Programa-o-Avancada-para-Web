
export const emprestimoSchemas = {
  EmprestimoInput: {
    type: "object",
    required: ["livroId", "leitorId"],
    properties: {
      livroId: {
        type: "integer",
        minimum: 1,
        example: 2,
      },
      leitorId: {
        type: "integer",
        minimum: 1,
        example: 2,
      },
      dataEmprestimo: {
        type: "string",
        format: "date",
        example: "2026-11-25",
      },
      dataDevolucao: {
        type: "string",
        format: "date",
        nullable: true,
        example: null,
      },
      status: {
        type: "string",
        enum: ["Emprestado", "Devolvido", "Atrasado"],
        default: "Emprestado",
      },
    },
  },

  LivroEmprestimo: {
    type: "object",
    properties: {
      id: {
        type: "integer",
      },
      titulo: {
        type: "string",
      },
      ISBN: {
        type: "string",
      },
      anoPublicacao: {
        type: "integer",
        nullable: true,
      },
      disponivel: {
        type: "boolean",
      },
      autorId: {
        type: "integer",
      },
    },
  },

  Emprestimo: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      livroId: {
        type: "integer",
        example: 2,
      },
      leitorId: {
        type: "integer",
        example: 2,
      },
      dataEmprestimo: {
        type: "string",
        format: "date-time",
      },
      dataDevolucao: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      status: {
        type: "string",
        enum: ["Emprestado", "Devolvido", "Atrasado"],
        example: "Emprestado",
      },
      livro: {
        $ref: "#/components/schemas/LivroEmprestimo",
      },
      leitor: {
        $ref: "#/components/schemas/Leitor",
      },
    },
  },
};

const idParametro = {
  name: "id",
  in: "path",
  required: true,
  description: "ID do empréstimo",
  schema: {
    type: "integer",
    minimum: 1,
  },
};

const corpoRequisicao = {
  required: true,
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/EmprestimoInput",
      },
    },
  },
};

function respostaEmprestimo(descricao: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Emprestimo",
        },
      },
    },
  };
}

function respostaErro(descricao: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Erro",
        },
      },
    },
  };
}

const erroValidacao = {
  description: "Dados inválidos ou regra de negócio violada",
  content: {
    "application/json": {
      schema: {
        anyOf: [
          {
            $ref: "#/components/schemas/Erro",
          },
          {
            $ref: "#/components/schemas/ErroValidacao",
          },
        ],
      },
    },
  },
};

export const emprestimoPaths = {
  "/emprestimos": {
    get: {
      tags: ["Empréstimos"],
      summary: "Listar todos os empréstimos",
      description:
        "Retorna os empréstimos cadastrados com os dados dos livros e leitores vinculados.",
      responses: {
        "200": {
          description: "Lista de empréstimos",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Emprestimo",
                },
              },
            },
          },
        },
        "401": respostaErro("Não autenticado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    post: {
      tags: ["Empréstimos"],
      summary: "Cadastrar um novo empréstimo",
      description:
        "Registra o empréstimo de um livro disponível para um leitor existente. O livro torna-se indisponível. O status inicial deve ser Emprestado e não deve existir data de devolução.",
      requestBody: corpoRequisicao,
      responses: {
        "201": respostaEmprestimo(
          "Empréstimo cadastrado com sucesso"
        ),
        "400": erroValidacao,
        "401": respostaErro("Não autenticado"),
        "404": respostaErro(
          "Livro ou leitor não encontrado"
        ),
        "409": respostaErro(
          "Livro indisponível, relacionamento inválido ou conflito de operação"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },

  "/emprestimos/{id}": {
    get: {
      tags: ["Empréstimos"],
      summary: "Buscar empréstimo pelo ID",
      parameters: [idParametro],
      responses: {
        "200": respostaEmprestimo("Empréstimo encontrado"),
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Empréstimo não encontrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    put: {
      tags: ["Empréstimos"],
      summary: "Atualizar um empréstimo",
      description:
        "Permite atualizar os dados e o status do empréstimo. Ao registrar uma devolução, o livro torna-se disponível. A data de devolução não pode ser anterior à data do empréstimo.",
      parameters: [idParametro],
      requestBody: corpoRequisicao,
      responses: {
        "200": respostaEmprestimo(
          "Empréstimo atualizado com sucesso"
        ),
        "400": erroValidacao,
        "401": respostaErro("Não autenticado"),
        "404": respostaErro(
          "Empréstimo, livro ou leitor não encontrado"
        ),
        "409": respostaErro(
          "Livro indisponível, relacionamento inválido ou conflito de operação"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    delete: {
      tags: ["Empréstimos"],
      summary: "Excluir um empréstimo",
      description:
        "Exclui o registro do empréstimo. Caso esteja ativo, o livro volta a ficar disponível.",
      parameters: [idParametro],
      responses: {
        "204": {
          description: "Empréstimo excluído com sucesso",
        },
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Empréstimo não encontrado"),
        "409": respostaErro("Conflito de operação"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },
};
