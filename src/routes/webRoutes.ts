import express from "express";
import { WebController } from "../controllers/WebController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/scrape", authenticate, WebController.scrapeAndSave);

export default router;
