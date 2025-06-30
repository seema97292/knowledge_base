import { Response } from "express";
import Document from "../models/Document";
import User from "../models/User";
import { AuthRequest } from "../types";

// @desc    Get all documents accessible to user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documents = await Document.find({
      $or: [
        { author: req.user!._id },
        { "sharedWith.user": req.user!._id },
        { visibility: "public" },
      ],
    })
      .populate("author", "username email")
      .populate("lastModifiedBy", "username email")
      .select("-content -versionHistory")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private/Public (depending on visibility)
const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("author", "username email")
      .populate("lastModifiedBy", "username email")
      .populate("sharedWith.user", "username email");

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Check access permissions
    const hasAccess =
      document.visibility === "public" ||
      (document.author as any)._id.toString() === req.user!._id.toString() ||
      document.sharedWith.some(
        (share) =>
          (share.user as any)._id.toString() === req.user!._id.toString(),
      );

    if (!hasAccess) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.json(document);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
const createDocument = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, content = "", visibility = "private" } = req.body;

    const document = await Document.create({
      title,
      content,
      author: req.user!._id,
      lastModifiedBy: req.user!._id,
      visibility,
      versionHistory: [
        {
          version: 1,
          content,
          changedBy: req.user!._id,
          changedAt: new Date(),
        },
      ],
    });

    const newDocument = await Document.findById(document._id)
      .populate("author", "username email")
      .populate("lastModifiedBy", "username email");

    res.status(201).json(newDocument);
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, content } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Check edit permissions
    const canEdit =
      (document.author as any).toString() === req.user!._id.toString() ||
      document.sharedWith.some(
        (share) =>
          (share.user as any).toString() === req.user!._id.toString() &&
          share.permission === "edit",
      );

    if (!canEdit) {
      res.status(403).json({ message: "No edit permission" });
      return;
    }

    // Create new version entry
    const newVersion = document.versionHistory.length + 1;
    document.versionHistory.push({
      version: newVersion,
      content: content || document.content,
      changedBy: req.user!._id as any,
      changedAt: new Date(),
    });

    // Update document
    document.title = title || document.title;
    document.content = content || document.content;
    document.lastModifiedBy = req.user!._id as any;

    // Process mentions in content
    await processMentions(
      document,
      content || document.content,
      req.user!._id as string,
    );

    await document.save();

    const updatedDocument = await Document.findById(document._id)
      .populate("author", "username email")
      .populate("lastModifiedBy", "username email")
      .populate("sharedWith.user", "username email");

    res.json(updatedDocument);
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Only author can delete
    if ((document.author as any).toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search documents
// @route   GET /api/documents/search
// @access  Private
const searchDocuments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const documents = await Document.find({
      $and: [
        {
          $or: [
            { author: req.user!._id },
            { "sharedWith.user": req.user!._id },
            { visibility: "public" },
          ],
        },
        {
          $text: { $search: q },
        },
      ],
    })
      .populate("author", "username email")
      .populate("lastModifiedBy", "username email")
      .select("-content -versionHistory")
      .sort({ score: { $meta: "textScore" }, updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Search documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update document visibility
// @route   PATCH /api/documents/:id/visibility
// @access  Private
const updateVisibility = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { visibility } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Only author can change visibility
    if ((document.author as any).toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    document.visibility = visibility;
    await document.save();

    res.json({ message: "Visibility updated successfully", visibility });
  } catch (error) {
    console.error("Update visibility error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Share document with user
// @route   POST /api/documents/:id/share
// @access  Private
const shareDocument = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, permission = "view" } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Only author can share
    if ((document.author as any).toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Check if user exists
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already shared
    const existingShare = document.sharedWith.find(
      (share) => (share.user as any).toString() === userId,
    );

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      document.sharedWith.push({
        user: userId,
        permission,
        sharedAt: new Date(),
      });
    }

    await document.save();

    const updatedDocument = await Document.findById(document._id)
      .populate("author", "username email")
      .populate("sharedWith.user", "username email");

    res.json(updatedDocument);
  } catch (error) {
    console.error("Share document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove access from document
// @route   DELETE /api/documents/:id/share/:userId
// @access  Private
const removeAccess = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Only author can remove access
    if ((document.author as any).toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    document.sharedWith = document.sharedWith.filter(
      (share) => (share.user as any).toString() !== userId,
    );

    await document.save();

    res.json({ message: "Access removed successfully" });
  } catch (error) {
    console.error("Remove access error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to process mentions in content
const processMentions = async (
  document: any,
  content: string,
  _userId: string,
): Promise<void> => {
  try {
    // Extract mentions from content (assuming @username format)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    if (mentions.length > 0) {
      // Find users by username
      const mentionedUsers = await User.find({
        username: { $in: mentions },
      }).select("_id username email");

      // Add mentioned users to sharedWith if not already shared
      for (const user of mentionedUsers) {
        const alreadyShared = document.sharedWith.some(
          (share: any) =>
            (share.user as any).toString() === (user._id as any).toString(),
        );

        if (
          !alreadyShared &&
          (user._id as any).toString() !== (document.author as any).toString()
        ) {
          document.sharedWith.push({
            user: user._id,
            permission: "view",
            sharedAt: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Process mentions error:", error);
  }
};

export {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  updateVisibility,
  shareDocument,
  removeAccess,
};
