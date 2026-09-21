import { Router } from "express";
import { query } from "../database.js";
import { ah } from "../errors.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types.js";
export const dashboardRouter = Router();
dashboardRouter.get("/", requireAuth, ah(async (req: AuthenticatedRequest, res) => {
  const { tenantId, clinicId } = req.user!;
  const one = async (sql: string, values: unknown[] = [tenantId, clinicId]) => Number((await query<{ n: string }>(sql, values)).rows[0].n);
  const [patients, appointmentsToday, consultationsToday, medicineUnits, lowStockAlerts, visitsToday, dispensedToday, stages] = await Promise.all([
    one("SELECT count(*) AS n FROM patients WHERE tenant_id=$1 AND clinic_id=$2"),
    one("SELECT count(*) AS n FROM appointments WHERE tenant_id=$1 AND clinic_id=$2 AND scheduled_start::date=CURRENT_DATE"),
    one("SELECT count(*) AS n FROM consultations WHERE tenant_id=$1 AND clinic_id=$2 AND created_at::date=CURRENT_DATE"),
    one("SELECT coalesce(sum(quantity_on_hand),0) AS n FROM medications WHERE tenant_id=$1", [tenantId]),
    one("SELECT count(*) AS n FROM medications WHERE tenant_id=$1 AND quantity_on_hand<=reorder_threshold", [tenantId]),
    one("SELECT count(*) AS n FROM visits WHERE tenant_id=$1 AND clinic_id=$2 AND created_at::date=CURRENT_DATE"),
    one("SELECT count(*) AS n FROM prescriptions WHERE tenant_id=$1 AND clinic_id=$2 AND dispensed_at::date=CURRENT_DATE", [tenantId, clinicId]),
    query<{ stage: string; n: string }>("SELECT stage,count(*) AS n FROM visits WHERE tenant_id=$1 AND clinic_id=$2 AND stage<>'DONE' GROUP BY stage", [tenantId, clinicId])
  ]);
  res.json({ data: { patients, appointmentsToday, consultationsToday, medicineUnits, lowStockAlerts, visitsToday, dispensedToday, queue: Object.fromEntries(stages.rows.map((r) => [r.stage, Number(r.n)])) } });
}));
