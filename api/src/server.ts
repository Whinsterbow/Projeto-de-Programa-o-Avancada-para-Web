
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { prisma } from "./config/prisma";
import { swaggerDocument } from "./config/swagger";

import autorRoutes from "./routes/autor.routes";
import livroRoutes from "./routes/livro.routes";
import leitorRoutes from "./routes/leitor.routes";
import emprestimoRoutes from "./routes/emprestimo.routes";
import usuarioRoutes from "./routes/usuario.routes";

import { autenticar } from "./middlewares/auth.middleware";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use("/usuarios", usuarioRoutes);

app.use("/autores", autenticar, autorRoutes);
app.use("/livros", autenticar, livroRoutes);
app.use("/leitores", autenticar, leitorRoutes);
app.use("/emprestimos", autenticar, emprestimoRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    mensagem: "API do Sistema de Biblioteca funcionando!",
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      bancoDeDados: "Conectado",
    });
  } catch (error) {
    res.status(503).json({
      status: "erro",
      bancoDeDados: "Desconectado",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/docs`);
});
