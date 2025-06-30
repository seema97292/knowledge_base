import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  updateVisibility,
  shareDocument,
  removeAccess,
} from "../controllers/documentController";
import versionRoutes from "./versions";

const router = express.Router();

// Validation middleware
const createDocumentValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
];

const updateDocumentValidation = [
  body("title")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
];

const visibilityValidation = [
  body("visibility")
    .isIn(["public", "private"])
    .withMessage("Visibility must be either public or private"),
];

const shareValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  body("permission")
    .optional()
    .isIn(["view", "edit"])
    .withMessage("Permission must be either view or edit"),
];

// Routes
router.get("/search", protect, searchDocuments);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocument);
router.post("/", protect, createDocumentValidation, createDocument);
router.put("/:id", protect, updateDocumentValidation, updateDocument);
router.delete("/:id", protect, deleteDocument);
router.put("/:id/visibility", protect, visibilityValidation, updateVisibility);
router.post("/:id/share", protect, shareValidation, shareDocument);
router.delete("/:id/share", protect, removeAccess);

// Nested routes for versions
router.use("/:id/versions", versionRoutes);

export default router;
