
export const leitorSchemas = {
  LeitorInput: {
    type: "object",
    required: ["nome", "CPF", "email"],
    properties: {
      nome: {
        type: "string",
        minLength: 3,
        example: "Pedro Oliveira",
      },
      CPF: {
        type: "string",
        pattern: "^[0-9]{11}$",
        example: "11122233344",
      },
      email: {
        type: "string",
        format: "email",
        example: "pedro@example.com",
      },
      telefone: {
        type: "string",
        example: "83988887777",
      },
    },
  },

  Leitor: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 3,
      },
      nome: {
        type: "string",
        example: "Pedro Oliveira",
      },
      CPF: {
        type: "string",
        example: "11122233344",
      },
      email: {
        type: "string",
        format: "email",
        example: "pedro@example.com",
      },
      telefone: {
        type: "string",
        nullable: true,
        example: "83988887777",
      },
    },
  },
};

const idParametro = {
  name: "id",
  in: "path",
  required: true,
  description: "ID do leitor",
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
        $ref: "#/components/schemas/LeitorInput",
      },
    },
  },
};

function respostaLeitor(descricao: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Leitor",
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
  description: "Dados inválidos",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErroValidacao",
      },
    },
  },
};

const erroAtualizacao = {
  description: "ID ou dados inválidos",
  content: {
    "application/json": {
      schema: {
        oneOf: [
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

export const leitorPaths = {
  "/leitores": {
    get: {
      tags: ["Leitores"],
      summary: "Listar todos os leitores",
      responses: {
        "200": {
          description: "Lista de leitores",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Leitor",
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
      tags: ["Leitores"],
      summary: "Cadastrar um novo leitor",
      description:
        "Cadastra um leitor. O CPF e o e-mail devem ser únicos.",
      requestBody: corpoRequisicao,
      responses: {
        "201": respostaLeitor("Leitor cadastrado com sucesso"),
        "400": erroValidacao,
        "401": respostaErro("Não autenticado"),
        "409": respostaErro("CPF ou e-mail já cadastrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },

  "/leitores/{id}": {
    get: {
      tags: ["Leitores"],
      summary: "Buscar leitor pelo ID",
      parameters: [idParametro],
      responses: {
        "200": respostaLeitor("Leitor encontrado"),
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Leitor não encontrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    put: {
      tags: ["Leitores"],
      summary: "Atualizar um leitor",
      parameters: [idParametro],
      requestBody: corpoRequisicao,
      responses: {
        "200": respostaLeitor("Leitor atualizado com sucesso"),
        "400": erroAtualizacao,
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Leitor não encontrado"),
        "409": respostaErro("CPF ou e-mail já cadastrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    delete: {
      tags: ["Leitores"],
      summary: "Excluir um leitor",
      description:
        "Não permite excluir leitores que possuem empréstimos vinculados.",
      parameters: [idParametro],
      responses: {
        "204": {
          description: "Leitor excluído com sucesso",
        },
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Leitor não encontrado"),
        "409": respostaErro(
          "Leitor possui empréstimos vinculados"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },
};
