
export const livroSchemas = {
  LivroInput: {
    type: "object",
    required: ["titulo", "ISBN", "autorId"],
    properties: {
      titulo: {
        type: "string",
        minLength: 1,
        example: "Capitães da Areia",
      },
      ISBN: {
        type: "string",
        pattern: "^[0-9]{13}$",
        example: "9788535914061",
      },
      anoPublicacao: {
        type: "integer",
        minimum: 1,
        example: 1937,
      },
      disponivel: {
        type: "boolean",
        default: true,
        example: true,
      },
      autorId: {
        type: "integer",
        minimum: 1,
        example: 1,
      },
    },
  },

  Livro: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 3,
      },
      titulo: {
        type: "string",
        example: "Capitães da Areia",
      },
      ISBN: {
        type: "string",
        example: "9788535914061",
      },
      anoPublicacao: {
        type: "integer",
        nullable: true,
        example: 1937,
      },
      disponivel: {
        type: "boolean",
        example: true,
      },
      autorId: {
        type: "integer",
        example: 1,
      },
      autor: {
        $ref: "#/components/schemas/Autor",
      },
    },
  },
};

const idParametro = {
  name: "id",
  in: "path",
  required: true,
  description: "ID do livro",
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
        $ref: "#/components/schemas/LivroInput",
      },
    },
  },
};

function respostaLivro(descricao: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Livro",
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

export const livroPaths = {
  "/livros": {
    get: {
      tags: ["Livros"],
      summary: "Listar todos os livros",
      description:
        "Retorna os livros cadastrados e seus respectivos autores.",
      responses: {
        "200": {
          description: "Lista de livros",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Livro",
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
      tags: ["Livros"],
      summary: "Cadastrar um novo livro",
      description:
        "Cadastra um livro vinculado a um autor existente. O ISBN deve ser único.",
      requestBody: corpoRequisicao,
      responses: {
        "201": respostaLivro("Livro cadastrado com sucesso"),
        "400": erroValidacao,
        "401": respostaErro("Não autenticado"),
        "409": respostaErro(
          "ISBN já cadastrado ou autor inexistente"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },

  "/livros/{id}": {
    get: {
      tags: ["Livros"],
      summary: "Buscar livro pelo ID",
      parameters: [idParametro],
      responses: {
        "200": respostaLivro("Livro encontrado"),
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Livro não encontrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    put: {
      tags: ["Livros"],
      summary: "Atualizar um livro",
      description:
        "Atualiza os dados de um livro. Não permite disponibilizar um livro que possui empréstimo ativo.",
      parameters: [idParametro],
      requestBody: corpoRequisicao,
      responses: {
        "200": respostaLivro("Livro atualizado com sucesso"),
        "400": erroAtualizacao,
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Livro não encontrado"),
        "409": respostaErro(
          "ISBN duplicado, autor inexistente, empréstimo ativo ou conflito de operação"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    delete: {
      tags: ["Livros"],
      summary: "Excluir um livro",
      description:
        "Não permite excluir livros que possuem empréstimos vinculados.",
      parameters: [idParametro],
      responses: {
        "204": {
          description: "Livro excluído com sucesso",
        },
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Livro não encontrado"),
        "409": respostaErro(
          "Livro possui empréstimos vinculados"
        ),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },
};
