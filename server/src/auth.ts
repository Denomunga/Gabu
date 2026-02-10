import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<any> {
  const user = await User.findOne({ email });
  if (!user) return null;

  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) return null;

  return user;
}

export function requireAuth(req: any, res: any, next: any) {
  const rawAuth = req.headers.authorization;
  if (rawAuth) {
    // mask token body for logs
    const masked = rawAuth.replace(/Bearer\s+(.{4}).*(.{4})/, 'Bearer $1...$2');
    console.log('[DEBUG] requireAuth - Authorization header:', masked);
  } else {
    console.log('[DEBUG] requireAuth - Authorization header: none');
  }

  const token = rawAuth?.split(" ")[1];
  console.log('[DEBUG] requireAuth - token length:', token ? token.length : 0);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  console.log('[DEBUG] requireAuth - token decoded:', decoded);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (decoded.role !== "admin" && decoded.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
}

export function requireSuperAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (decoded.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
}
