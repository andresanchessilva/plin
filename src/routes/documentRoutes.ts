import { Router } from "express";
import { DocumentController } from "../controllers/DocumentController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, DocumentController.getAll);
router.get("/:id", authenticate, DocumentController.getById);
router.get("/client/:clientId", authenticate, DocumentController.getByClient);
router.get("/user/:userId", authenticate, DocumentController.getByUser);
router.post("/", authenticate, DocumentController.create);
router.put("/:id", authenticate, DocumentController.update);
router.delete("/:id", authenticate, DocumentController.delete);

export default router;
