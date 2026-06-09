import { Router } from "express";
import { z } from "zod";
import { query } from "../database.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import type { AuthenticatedRequest } from "../types.js";

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  scheduledStart: z.string().datetime(),
  reason: z.string().optional().nullable()
});

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth);

appointmentsRouter.get("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await query(
      `SELECT a.id, a.scheduled_start, a.status, a.reason, p.patient_number, p.first_name, p.last_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       WHERE a.tenant_id = $1 AND a.clinic_id = $2
       ORDER BY a.scheduled_start ASC
       LIMIT 50`,
      [req.user!.tenantId, req.user!.clinicId]
    );

    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

appointmentsRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = appointmentSchema.parse(req.body);
    const result = await query<{ id: string }>(
      `INSERT INTO appointments (tenant_id, clinic_id, patient_id, scheduled_start, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [req.user!.tenantId, req.user!.clinicId, payload.patientId, payload.scheduledStart, payload.reason || null]
    );

    await audit(req.user, "APPOINTMENT_BOOKED", "Appointment", result.rows[0].id);
    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

