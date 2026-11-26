
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.emprestimo.deleteMany();
  await prisma.livro.deleteMany();
  await prisma.autor.deleteMany();
  await prisma.leitor.deleteMany();
  await prisma.usuario.deleteMany();

  const autor1 = await prisma.autor.create({
    data: {
      nome: "Machado de Assis",
      nacionalidade: "Brasileira",
      dataNascimento: new Date("1839-06-21"),
    },
  });

  const autor2 = await prisma.autor.create({
    data: {
      nome: "Clarice Lispector",
      nacionalidade: "Brasileira",
      dataNascimento: new Date("1920-12-10"),
    },
  });

  const livro1 = await prisma.livro.create({
    data: {
      titulo: "Dom Casmurro",
      ISBN: "9788535910663",
      anoPublicacao: 1899,
      disponivel: false,
      autorId: autor1.id,
    },
  });

  await prisma.livro.create({
    data: {
      titulo: "A Hora da Estrela",
      ISBN: "9788532508126",
      anoPublicacao: 1977,
      disponivel: true,
      autorId: autor2.id,
    },
  });

  const leitor1 = await prisma.leitor.create({
    data: {
      nome: "João Silva",
      CPF: "12345678900",
      email: "joao@example.com",
      telefone: "83999999999",
    },
  });

  await prisma.leitor.create({
    data: {
      nome: "Maria Santos",
      CPF: "98765432100",
      email: "maria@example.com",
      telefone: "83888888888",
    },
  });

  await prisma.emprestimo.create({
    data: {
      livroId: livro1.id,
      leitorId: leitor1.id,
      status: "Emprestado",
    },
  });

  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@biblioteca.com",
      senhaHash,
    },
  });

  console.log("Seed executado com sucesso!");
}

main()
  .catch((error) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
