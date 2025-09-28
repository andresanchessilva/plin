import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, ClientController.getAll);
router.get("/:id", authenticate, ClientController.getById);
router.post("/", authenticate, ClientController.create);
router.put("/:id", authenticate, ClientController.update);
router.delete("/:id", authenticate, ClientController.delete);

export default router;
