import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", UserController.login);
router.post("/refresh-token", UserController.refreshToken);

router.post("/", authenticate, UserController.createUser);
router.get("/", authenticate, UserController.getAllUsers);
router.get("/:id", authenticate, UserController.getUserById);
router.put("/:id", authenticate, UserController.updateUser);
router.delete("/:id", authenticate, UserController.deleteUser);

router.post("/create-default-admin", UserController.createDefaultAdmin);

export default router;
