import { Router } from "express";
import ocorrenciaController from "../controllers/ocorrenciaController";
import { authMiddleware } from "../middlewares/auth";
import upload from "../middlewares/upload";

const router = Router();

// post
router.post("/", authMiddleware, upload.array("fotos", 10), ocorrenciaController.criar);
router.post("/sync", authMiddleware, ocorrenciaController.sync);

// get
router.get("/", authMiddleware, ocorrenciaController.listar);
router.get("/pending", authMiddleware, ocorrenciaController.pendingList);
router.get("/:id", authMiddleware, ocorrenciaController.buscarPorId);

// atualizar pendente
router.patch("/:id", authMiddleware, upload.array("fotos", 10), ocorrenciaController.updatePending);

// deletar
router.delete("/:id", authMiddleware, ocorrenciaController.deletar);

export default router;