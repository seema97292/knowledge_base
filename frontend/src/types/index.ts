

export interface User {
  _id: string;
  username: string;
  email: string;
  name?: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  author: User;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: User;
  sharedWith?: {
    user: User;
    permission: "read" | "edit";
  }[];
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ComponentProps {
  className?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export interface InputProps extends ComponentProps {
  type?: string;
}

export interface BadgeProps extends ComponentProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface CardProps extends ComponentProps {}
export interface LabelProps extends ComponentProps {}
