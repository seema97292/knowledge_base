import express from "express";
import { body } from "express-validator";
import { protect, protectWithoutAuth } from "../middleware/auth";
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
  body("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("permission")
    .optional()
    .isIn(["view", "edit"])
    .withMessage("Permission must be either view or edit"),
];

router.get("/search", protect, searchDocuments);
router.get("/", protect, getDocuments);
router.get("/:id", protectWithoutAuth, getDocument);
router.post("/", protect, createDocumentValidation, createDocument);
router.put("/:id", protect, updateDocumentValidation, updateDocument);
router.delete("/:id", protect, deleteDocument);
router.put("/:id/visibility", protect, visibilityValidation, updateVisibility);
router.post("/:id/share", protect, shareValidation, shareDocument);
router.delete("/:id/share/:userId", protect, removeAccess);

router.use("/:id/versions", versionRoutes);

export default router;
