import type { Request } from "express";

export type Role =
  | "SUPER_ADMIN"
  | "CLINIC_ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "PHARMACIST"
  | "RECEPTIONIST";

export interface AuthUser {
  id: string;
  tenantId: string;
  clinicId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

