import express from "express";
import { protect } from "../middleware/auth";
import {
  getVersions,
  getVersion,
  compareVersions,
} from "../controllers/versionController";

const router = express.Router({ mergeParams: true });

// Routes
router.get("/", protect, getVersions);
router.get("/:versionId", protect, getVersion);
router.get("/:versionId/diff", protect, compareVersions);

export default router;
