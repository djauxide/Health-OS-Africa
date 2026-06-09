import { Router } from "express";
import { query } from "../database.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { tenantId, clinicId } = req.user!;
    const [patients, appointments, consultations, meds, lowStock] = await Promise.all([
      query<{ count: string }>("SELECT count(*) FROM patients WHERE tenant_id = $1 AND clinic_id = $2", [tenantId, clinicId]),
      query<{ count: string }>(
        "SELECT count(*) FROM appointments WHERE tenant_id = $1 AND clinic_id = $2 AND scheduled_start::date = CURRENT_DATE",
        [tenantId, clinicId]
      ),
      query<{ count: string }>(
        "SELECT count(*) FROM consultations WHERE tenant_id = $1 AND clinic_id = $2 AND created_at::date = CURRENT_DATE",
        [tenantId, clinicId]
      ),
      query<{ total: string }>("SELECT coalesce(sum(quantity_on_hand), 0) AS total FROM medications WHERE tenant_id = $1", [tenantId]),
      query<{ count: string }>(
        "SELECT count(*) FROM medications WHERE tenant_id = $1 AND quantity_on_hand <= reorder_threshold",
        [tenantId]
      )
    ]);

    return res.json({
      data: {
        patients: Number(patients.rows[0].count),
        appointmentsToday: Number(appointments.rows[0].count),
        consultationsToday: Number(consultations.rows[0].count),
        medicineUnits: Number(meds.rows[0].total),
        lowStockAlerts: Number(lowStock.rows[0].count)
      }
    });
  } catch (error) {
    return next(error);
  }
});

