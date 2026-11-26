import { Router } from "express";
import { leitorController } from "../controllers/leitor.controller";

const router = Router();

router.get("/", leitorController.listar);
router.get("/:id", leitorController.buscarPorId);
router.post("/", leitorController.criar);
router.put("/:id", leitorController.atualizar);
router.delete("/:id", leitorController.excluir);

export default router;