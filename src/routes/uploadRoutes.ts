import { Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { upload, cleanupTempFiles } from "../middleware/upload";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/pdf",
  authenticate,
  upload.single("pdf"),
  cleanupTempFiles,
  UploadController.uploadPDF
);

export default router;
