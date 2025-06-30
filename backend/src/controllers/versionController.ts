import { Response } from "express";
import Document from "../models/Document";
import { AuthRequest } from "../types";

const getVersions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("versionHistory.changedBy", "username email")
      .select("versionHistory title author");

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    const hasAccess =
      (document.author as any).toString() === req.user!._id.toString() ||
      document.sharedWith.some(
        (share) => (share.user as any).toString() === req.user!._id.toString()
      ) ||
      document.visibility === "public";

    if (!hasAccess) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const versions = document.versionHistory
      .sort((a, b) => b.version - a.version)
      .map((version) => ({
        _id: version._id,
        version: version.version,
        changedBy: version.changedBy,
        changedAt: version.changedAt,
        contentPreview:
          version.content.substring(0, 200) +
          (version.content.length > 200 ? "..." : ""),
      }));

    res.json({
      documentId: document._id,
      documentTitle: document.title,
      versions,
    });
  } catch (error) {
    console.error("Get versions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getVersion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("versionHistory.changedBy", "username email")
      .populate("author", "username email");

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    const hasAccess =
      (document.author as any)._id.toString() === req.user!._id.toString() ||
      document.sharedWith.some(
        (share) => (share.user as any).toString() === req.user!._id.toString()
      ) ||
      document.visibility === "public";

    if (!hasAccess) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const version = document.versionHistory.find(
      (v) => (v._id as any).toString() === req.params.versionId
    );

    if (!version) {
      res.status(404).json({ message: "Version not found" });
      return;
    }

    res.json({
      documentId: document._id,
      documentTitle: document.title,
      documentAuthor: document.author,
      version: {
        _id: version._id,
        version: version.version,
        content: version.content,
        changedBy: version.changedBy,
        changedAt: version.changedAt,
      },
    });
  } catch (error) {
    console.error("Get version error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const compareVersions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { compareWith } = req.query;

    const document = await Document.findById(req.params.id).populate(
      "versionHistory.changedBy",
      "username email"
    );

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    const hasAccess =
      (document.author as any).toString() === req.user!._id.toString() ||
      document.sharedWith.some(
        (share) => (share.user as any).toString() === req.user!._id.toString()
      ) ||
      document.visibility === "public";

    if (!hasAccess) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const targetVersion = document.versionHistory.find(
      (v) => (v._id as any).toString() === req.params.versionId
    );

    if (!targetVersion) {
      res.status(404).json({ message: "Version not found" });
      return;
    }

    let compareVersion;
    if (compareWith && typeof compareWith === "string") {
      compareVersion = document.versionHistory.find(
        (v) => (v._id as any).toString() === compareWith
      );
      if (!compareVersion) {
        res.status(404).json({ message: "Comparison version not found" });
        return;
      }
    } else {
      compareVersion = {
        version: "current" as any,
        content: document.content,
        changedBy: document.lastModifiedBy,
        changedAt: document.updatedAt,
      };
    }

    const diff = generateSimpleDiff(
      targetVersion.content,
      compareVersion.content
    );

    res.json({
      documentId: document._id,
      documentTitle: document.title,
      comparison: {
        from: {
          version: targetVersion.version,
          changedBy: targetVersion.changedBy,
          changedAt: targetVersion.changedAt,
        },
        to: {
          version: compareVersion.version,
          changedBy: compareVersion.changedBy,
          changedAt: compareVersion.changedAt,
        },
        diff,
      },
    });
  } catch (error) {
    console.error("Compare versions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

interface DiffChange {
  type: "removed" | "added" | "modified";
  lineNumber: number;
  content?: string;
  oldContent?: string;
  newContent?: string;
}

const generateSimpleDiff = (
  oldContent: string,
  newContent: string
): DiffChange[] => {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  const changes: DiffChange[] = [];
  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[i] || "";

    if (oldLine !== newLine) {
      if (oldLine && !newLine) {
        changes.push({
          type: "removed",
          lineNumber: i + 1,
          content: oldLine,
        });
      } else if (!oldLine && newLine) {
        changes.push({
          type: "added",
          lineNumber: i + 1,
          content: newLine,
        });
      } else {
        changes.push({
          type: "modified",
          lineNumber: i + 1,
          oldContent: oldLine,
          newContent: newLine,
        });
      }
    }
  }

  return changes;
};

export { getVersions, getVersion, compareVersions };
