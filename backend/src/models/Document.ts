import { Schema, model } from "mongoose";
import { IDocument, ISharedUser, IVersionHistory } from "../types";

const SharedUserSchema = new Schema<ISharedUser>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  permission: {
    type: String,
    enum: ["view", "edit"],
    default: "view",
  },
  sharedAt: {
    type: Date,
    default: Date.now,
  },
});

const VersionHistorySchema = new Schema<IVersionHistory>({
  version: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

const DocumentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: [true, "Document title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  content: {
    type: String,
    default: "",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private",
  },
  sharedWith: [SharedUserSchema],
  versionHistory: [VersionHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create text index for search functionality
DocumentSchema.index({ title: "text", content: "text" });

// Update the updatedAt field before saving
DocumentSchema.pre<IDocument>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default model<IDocument>("Document", DocumentSchema);
