import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthUser, AuthenticatedRequest, Role } from "../types.js";

interface TokenPayload {
  sub: string;
  tenant_id: string;
  clinic_id: string;
  email: string;
  role: Role;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Missing access token" } });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const user: AuthUser = {
      id: payload.sub,
      tenantId: payload.tenant_id,
      clinicId: payload.clinic_id,
      email: payload.email,
      role: payload.role
    };

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid or expired token" } });
  }
}

export function requireRole(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Missing access token" } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient role permissions" } });
    }

    return next();
  };
}

