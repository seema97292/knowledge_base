import { Response } from "express";
import Document from "../models/Document";
import User from "../models/User";
import sendEmail from "../utils/sendEmail";
import { AuthRequest } from "../types";

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

    const hasAccess =
      document.visibility === "public" ||
      (document.author as any)._id.toString() === req.user?._id.toString() ||
      document.sharedWith.some(
        (share) =>
          (share.user as any)?._id.toString() === req.user?._id.toString(),
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

    const newVersion = document.versionHistory.length + 1;
    document.versionHistory.push({
      version: newVersion,
      content: content || document.content,
      changedBy: req.user!._id as any,
      changedAt: new Date(),
    });

    document.title = title || document.title;
    document.content = content || document.content;
    document.lastModifiedBy = req.user!._id as any;

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

const shareDocument = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email, permission = "view" } = req.body;

    const document = await Document.findById(req.params.id).populate(
      "author",
      "username email",
    );

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    if ((document.author as any)._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      res.status(404).json({ message: "User not found with this email" });
      return;
    }

    // Don't allow sharing with yourself
    if ((userToShare._id as any).toString() === req.user!._id.toString()) {
      res.status(400).json({ message: "Cannot share document with yourself" });
      return;
    }

    const existingShare = document.sharedWith.find(
      (share) =>
        (share.user as any).toString() === (userToShare._id as any).toString(),
    );

    const isNewShare = !existingShare;

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      document.sharedWith.push({
        user: userToShare._id as any,
        permission,
        sharedAt: new Date(),
      });
    }

    await document.save();

    // Send email notification for new shares
    if (isNewShare) {
      try {
        const APP_URL = process.env.FRONTEND_URL;
        const documentUrl = `${APP_URL}/documents/${document._id}`;
        const sharedByUser = document.author as any;

        const message = `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333;">Document Shared with You!</h1>
            <p>Hello ${userToShare.username},</p>
            <p><strong>${sharedByUser.username}</strong> has shared a document with you:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #495057; margin: 0 0 10px 0;">${document.title}</h2>
              <p style="color: #6c757d; margin: 0;">Permission: <strong>${permission}</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${documentUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Document</a>
            </div>
            
            <p>You can access this document anytime by logging into your account.</p>
            <p>If you have any questions, feel free to contact ${sharedByUser.username} at ${sharedByUser.email}.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;" />
            <p style="color: #6c757d; font-size: 12px;">
              This notification was sent because a document was shared with you on Knowledge Base Platform.
            </p>
          </div>
        `;

        await sendEmail({
          email: userToShare.email,
          subject: `Document "${document.title}" shared with you`,
          html: message,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the request if email fails
      }
    }

    const updatedDocument = await Document.findById(document._id)
      .populate("author", "username email")
      .populate("sharedWith.user", "username email");

    res.json({
      message: isNewShare
        ? `Document shared with ${userToShare.username} successfully`
        : `Permission updated for ${userToShare.username}`,
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Share document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeAccess = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

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

const processMentions = async (
  document: any,
  content: string,
  _userId: string,
): Promise<void> => {
  try {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    if (mentions.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: mentions },
      }).select("_id username email");

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
