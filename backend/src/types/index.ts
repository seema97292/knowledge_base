import { Request } from "express";
import { Document as MongooseDocument, Types } from "mongoose";

// User interface
export interface IUser extends MongooseDocument {
  username: string;
  email: string;
  password: string;
  resetPasswordToken?: string | undefined;
  resetPasswordExpire?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Document interface
export interface ISharedUser {
  user: Types.ObjectId;
  permission: "view" | "edit";
  sharedAt: Date;
}

export interface IVersionHistory {
  _id?: Types.ObjectId;
  version: number;
  content: string;
  changedBy: Types.ObjectId;
  changedAt: Date;
}

export interface IDocument extends MongooseDocument {
  title: string;
  content: string;
  author: Types.ObjectId;
  lastModifiedBy?: Types.ObjectId;
  visibility: "public" | "private";
  sharedWith: ISharedUser[];
  versionHistory: IVersionHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Version interface
export interface IVersion extends MongooseDocument {
  documentId: string;
  version: number;
  content: string;
  author: string;
  changes: string;
  createdAt: Date;
}

// Auth request interface
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

// JWT payload interface
export interface JWTPayload {
  id: string;
  username: string;
  email: string;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Environment variables
export interface EnvVariables {
  NODE_ENV: string;
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  FRONTEND_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}
