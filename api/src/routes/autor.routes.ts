import { Router } from "express";
import { autorController } from "../controllers/autor.controller";

const router = Router();

router.get("/", autorController.listar);
router.get("/:id", autorController.buscarPorId);
router.post("/", autorController.criar);
router.put("/:id", autorController.atualizar);
router.delete("/:id", autorController.excluir);

export default router;