import jwt from "jsonwebtoken";

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiration = process.env.JWT_EXPIRE || "24h";

  return (jwt as any).sign({ id }, secret, { expiresIn: expiration });
};

export default generateToken;
