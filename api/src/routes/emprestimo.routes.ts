import { Router } from "express";
import { emprestimoController } from "../controllers/emprestimo.controller";

const router = Router();

router.get("/", emprestimoController.listar);
router.get("/:id", emprestimoController.buscarPorId);
router.post("/", emprestimoController.criar);
router.put("/:id", emprestimoController.atualizar);
router.delete("/:id", emprestimoController.excluir);

export default router;