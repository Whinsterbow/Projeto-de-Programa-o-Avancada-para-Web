
import { autorSchemas, autorPaths } from "../docs/autor.docs";
import { livroSchemas, livroPaths } from "../docs/livro.docs";
import { leitorSchemas, leitorPaths } from "../docs/leitor.docs";
import {
  emprestimoSchemas,
  emprestimoPaths,
} from "../docs/emprestimo.docs";

export const swaggerDocument = {
  openapi: "3.0.3",

  info: {
    title: "API do Sistema de Biblioteca",
    version: "1.0.0",
    description:
      "API REST para gerenciamento de autores, livros, leitores, empréstimos e usuários de uma biblioteca.",
  },

  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Servidor de desenvolvimento",
    },
  ],

  tags: [
    {
      name: "Sistema",
      description: "Informações e status da API",
    },
    {
      name: "Usuários",
      description: "Cadastro e autenticação de usuários",
    },
    {
      name: "Autores",
      description: "Gerenciamento de autores",
    },
    {
      name: "Livros",
      description: "Gerenciamento de livros",
    },
    {
      name: "Leitores",
      description: "Gerenciamento de leitores",
    },
    {
      name: "Empréstimos",
      description: "Gerenciamento de empréstimos",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      Cadastro: {
        type: "object",
        required: ["nome", "email", "senha"],
        properties: {
          nome: {
            type: "string",
            minLength: 3,
            example: "Usuario Swagger",
          },
          email: {
            type: "string",
            format: "email",
            example: "swagger@biblioteca.com",
          },
          senha: {
            type: "string",
            format: "password",
            minLength: 6,
            writeOnly: true,
            example: "swagger123",
          },
        },
      },

      Login: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@biblioteca.com",
          },
          senha: {
            type: "string",
            format: "password",
            minLength: 1,
            writeOnly: true,
            example: "admin123",
          },
        },
      },

      Usuario: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          nome: {
            type: "string",
            example: "Administrador",
          },
          email: {
            type: "string",
            format: "email",
            example: "admin@biblioteca.com",
          },
          criadoEm: {
            type: "string",
            format: "date-time",
          },
        },
      },

      Erro: {
        type: "object",
        required: ["mensagem"],
        properties: {
          mensagem: {
            type: "string",
            example: "Erro ao realizar operação",
          },
        },
      },

      ErroValidacao: {
        type: "object",
        required: ["erros"],
        properties: {
          erros: {
            type: "object",
            properties: {
              formErrors: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              fieldErrors: {
                type: "object",
                additionalProperties: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },

      ...autorSchemas,
      ...livroSchemas,
      ...leitorSchemas,
      ...emprestimoSchemas,
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],

  paths: {
    "/": {
      get: {
        tags: ["Sistema"],
        summary: "Verificar funcionamento da API",
        security: [],
        responses: {
          "200": {
            description: "API funcionando corretamente",
          },
        },
      },
    },

    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Verificar conexão com o banco de dados",
        security: [],
        responses: {
          "200": {
            description: "Banco de dados conectado",
          },
          "503": {
            description: "Banco de dados desconectado",
          },
        },
      },
    },

    "/usuarios/cadastro": {
      post: {
        tags: ["Usuários"],
        summary: "Cadastrar um novo usuário",
        description:
          "Realiza o cadastro de um usuário e armazena a senha utilizando hash bcrypt.",
        security: [],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Cadastro",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "Usuário cadastrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mensagem: {
                      type: "string",
                      example: "Usuário cadastrado com sucesso",
                    },
                    usuario: {
                      $ref: "#/components/schemas/Usuario",
                    },
                  },
                },
              },
            },
          },

          "400": {
            description:
              "Dados inválidos ou senha acima do limite permitido",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      $ref: "#/components/schemas/ErroValidacao",
                    },
                    {
                      $ref: "#/components/schemas/Erro",
                    },
                  ],
                },
              },
            },
          },

          "409": {
            description: "E-mail já cadastrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Erro",
                },
              },
            },
          },

          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Erro",
                },
              },
            },
          },
        },
      },
    },

    "/usuarios/login": {
      post: {
        tags: ["Usuários"],
        summary: "Realizar login",
        description:
          "Valida as credenciais do usuário e retorna um token JWT com validade de 24 horas.",
        security: [],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Login",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mensagem: {
                      type: "string",
                      example: "Login realizado com sucesso",
                    },
                    usuario: {
                      $ref: "#/components/schemas/Usuario",
                    },
                    token: {
                      type: "string",
                      description: "Token JWT de autenticação",
                    },
                  },
                },
              },
            },
          },

          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErroValidacao",
                },
              },
            },
          },

          "401": {
            description: "E-mail ou senha incorretos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Erro",
                },
              },
            },
          },

          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Erro",
                },
              },
            },
          },
        },
      },
    },

    ...autorPaths,
    ...livroPaths,
    ...leitorPaths,
    ...emprestimoPaths,
  },
};
