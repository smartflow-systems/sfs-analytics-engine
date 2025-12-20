import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  workspaceId?: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Middleware to authenticate JWT tokens
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}

// Middleware to check if user is admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

// Middleware to authenticate API keys
export async function authenticateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const key = await storage.getApiKey(apiKey);

    if (!key || !key.isActive) {
      return res.status(403).json({ error: "Invalid or inactive API key" });
    }

    // Check if key is expired
    if (key.expiresAt && new Date() > new Date(key.expiresAt)) {
      return res.status(403).json({ error: "API key has expired" });
    }

    // Update last used timestamp
    await storage.updateApiKeyLastUsed(key.id);

    // Attach workspace ID to request
    req.workspaceId = key.workspaceId;

    next();
  } catch (error) {
    console.error("API key authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}

// Middleware to check workspace access
export async function checkWorkspaceAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID required" });
  }

  try {
    // Get workspace
    const workspace = await storage.getWorkspace(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if user is owner or member
    if (workspace.ownerId === req.user.userId) {
      req.workspaceId = workspaceId;
      return next();
    }

    const members = await storage.getWorkspaceMembers(workspaceId);
    const isMember = members.some(m => m.userId === req.user!.userId);

    if (!isMember) {
      return res.status(403).json({ error: "Access denied to this workspace" });
    }

    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    console.error("Workspace access check error:", error);
    return res.status(500).json({ error: "Access check failed" });
  }
}

// Middleware to check usage quota
export async function checkUsageQuota(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.workspaceId) {
    return res.status(400).json({ error: "Workspace ID required" });
  }

  try {
    const workspace = await storage.getWorkspace(req.workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if workspace has exceeded quota
    if (workspace.eventCount >= workspace.eventQuota) {
      return res.status(429).json({
        error: "Event quota exceeded",
        message: `Your workspace has reached its limit of ${workspace.eventQuota} events. Please upgrade your plan.`,
        currentCount: workspace.eventCount,
        quota: workspace.eventQuota,
        plan: workspace.plan,
      });
    }

    next();
  } catch (error) {
    console.error("Usage quota check error:", error);
    return res.status(500).json({ error: "Quota check failed" });
  }
}

// Generate a random API key
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 32;
  let result = "sfs_";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
