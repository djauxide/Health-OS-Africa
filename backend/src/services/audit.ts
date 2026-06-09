import { query } from "../database.js";
import type { AuthUser } from "../types.js";

export async function audit(user: AuthUser | undefined, eventType: string, targetType?: string, targetId?: string, metadata: Record<string, unknown> = {}) {
  await query(
    `INSERT INTO audit_logs (tenant_id, clinic_id, actor_user_id, event_type, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user?.tenantId ?? null, user?.clinicId ?? null, user?.id ?? null, eventType, targetType ?? null, targetId ?? null, metadata]
  );
}

