Projeto pra matéria Programação Avançada para Web, do professor Douglas Andrade de Meneses

Integrante:
Nome: Renan Alves Borges
RGM: 44659831

Tema do projeto:
Sistema de gerenciamento de uma biblioteca que permite cadastrar, consultar, editar e excluir autores, livros, leitores e empréstimos.

O sistema também possui cadastro e autenticação de usuários, controle de disponibilidade dos livros e registro de devoluções.

Tabelas do banco de dados:

Tabela - Descrição 

 Autor - Armazena os dados dos autores.
 Livro - Armazena os livros cadastrados.
 Leitor - Armazena os dados dos leitores.
 Emprestimo - Registra os empréstimos e devoluções. 
 Usuario - Armazena os dados de autenticação dos usuários.

Relacionamentos:

- Autor e Livro (1:N): um autor pode possuir vários livros.
- Livro e Emprestimo (1:N): um livro pode possuir vários registros de empréstimos.
- Leitor e Emprestimo (1:N): um leitor pode realizar vários empréstimos.
- Usuario: tabela independente utilizada para autenticação.

Tecnologias utilizadas

- Frontend: React, TypeScript, Vite e Axios.
- Backend: Node.js, Express e TypeScript.
- Banco de dados: PostgreSQL e Prisma ORM.
- Validação: Zod.
- Autenticação: bcrypt e JWT.
- Documentação da API: Swagger.
- Infraestrutura: Docker Compose.


Como executar o projeto:


Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Git.
- Docker e Docker Compose ou PostgreSQL instalado localmente.

Instalar as dependências

Clone o repositório, abra a pasta do projeto no terminal e execute:

```bash
npm install
```

Compile o módulo compartilhado:

```bash
npm run build -w shared
```

Subir o banco de dados

Na pasta raiz do projeto, execute:

```bash
docker compose up -d
```

Verifique se o banco está funcionando:

```bash
docker compose ps
```

O PostgreSQL estará disponível na porta 5432. Aguarde o banco ficar saudável (healthy) antes de continuar.

Caso utilize PostgreSQL instalado localmente, crie um banco de dados chamado `biblioteca` e ajuste as credenciais no arquivo `.env`.

Configurar as variáveis de ambiente

Crie o arquivo `api/.env` com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/biblioteca?schema=public"
PORT=3000
JWT_SECRET="substitua_por_uma_chave_secreta_de_no_minimo_32_caracteres"
```

Para gerar uma chave JWT, execute:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Substitua o valor de `JWT_SECRET` pela chave gerada.

Crie também o arquivo "frontend/.env":

```env
VITE_API_URL=http://localhost:3000
```

Os arquivos ".env.example" estão disponíveis como modelos.


Executar as migrations e o seed

Na pasta raiz do projeto, execute:

```bash
npm run prisma:generate -w api
npm run prisma:migrate -w api
npm run prisma:seed -w api
```

Esses comandos geram o Prisma Client, aplicam as migrations e inserem os dados iniciais no banco.

Atenção: o seed remove os registros existentes antes de inserir os dados de demonstração.

Iniciar a API:

Abra um terminal na pasta raiz e execute:

```bash
npm run dev -w api
```

Iniciar o frontend:

Abra outro terminal na pasta raiz e execute:

```bash
npm run dev -w frontend
```

Acessar o sistema:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

## 6. Usuário de demonstração

Credenciais cadastradas pelo seed:

- E-mail: admin@biblioteca.com
- Senha: admin123

Também é possível criar uma nova conta pela tela de cadastro



