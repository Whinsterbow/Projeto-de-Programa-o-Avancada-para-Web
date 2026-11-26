
export const autorSchemas = {
  AutorInput: {
    type: "object",
    required: ["nome"],
    properties: {
      nome: {
        type: "string",
        minLength: 3,
        example: "Jorge Amado",
      },
      nacionalidade: {
        type: "string",
        example: "Brasileira",
      },
      dataNascimento: {
        type: "string",
        format: "date",
        example: "1912-08-10",
      },
    },
  },

  Autor: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      nome: {
        type: "string",
        example: "Jorge Amado",
      },
      nacionalidade: {
        type: "string",
        nullable: true,
        example: "Brasileira",
      },
      dataNascimento: {
        type: "string",
        format: "date-time",
        nullable: true,
        example: "1912-08-10T00:00:00.000Z",
      },
    },
  },
};

const idParametro = {
  name: "id",
  in: "path",
  required: true,
  description: "ID do autor",
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
        $ref: "#/components/schemas/AutorInput",
      },
    },
  },
};

function respostaAutor(descricao: string) {
  return {
    description: descricao,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Autor",
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

export const autorPaths = {
  "/autores": {
    get: {
      tags: ["Autores"],
      summary: "Listar todos os autores",
      responses: {
        "200": {
          description: "Lista de autores",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Autor",
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
      tags: ["Autores"],
      summary: "Cadastrar um novo autor",
      requestBody: corpoRequisicao,
      responses: {
        "201": respostaAutor("Autor cadastrado com sucesso"),
        "400": erroValidacao,
        "401": respostaErro("Não autenticado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },

  "/autores/{id}": {
    get: {
      tags: ["Autores"],
      summary: "Buscar autor pelo ID",
      parameters: [idParametro],
      responses: {
        "200": respostaAutor("Autor encontrado"),
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Autor não encontrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    put: {
      tags: ["Autores"],
      summary: "Atualizar um autor",
      parameters: [idParametro],
      requestBody: corpoRequisicao,
      responses: {
        "200": respostaAutor("Autor atualizado com sucesso"),
        "400": erroAtualizacao,
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Autor não encontrado"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },

    delete: {
      tags: ["Autores"],
      summary: "Excluir um autor",
      description:
        "Não permite excluir autores que possuem livros vinculados.",
      parameters: [idParametro],
      responses: {
        "204": {
          description: "Autor excluído com sucesso",
        },
        "400": respostaErro("ID inválido"),
        "401": respostaErro("Não autenticado"),
        "404": respostaErro("Autor não encontrado"),
        "409": respostaErro("Autor possui livros vinculados"),
        "500": respostaErro("Erro interno do servidor"),
      },
    },
  },
};
