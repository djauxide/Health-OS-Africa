import { Router } from "express";
import { query } from "../database.js";
import { ah } from "../errors.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types.js";
export const auditRouter = Router();
auditRouter.use(requireAuth, requireRole(["CLINIC_ADMIN", "SUPER_ADMIN"]));
auditRouter.get("/", ah(async (req: AuthenticatedRequest, res) => { const limit = Math.min(Number(req.query.limit) || 100, 500); const r = await query(`SELECT a.id,a.event_type,a.target_type,a.target_id,a.metadata,a.created_at,u.email AS actor FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id WHERE a.tenant_id=$1 ORDER BY a.created_at DESC LIMIT $2`, [req.user!.tenantId, limit]); res.json({ data: r.rows }); }));
