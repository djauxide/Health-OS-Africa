import { Router } from "express";
import { z } from "zod";
import { query } from "../database.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import type { AuthenticatedRequest } from "../types.js";

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).default("UNKNOWN"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  medicalAidName: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable()
});

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

patientsRouter.get("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? `%${req.query.search}%` : "%";
    const result = await query(
      `SELECT id, patient_number, first_name, last_name, dob, gender, phone, email, created_at
       FROM patients
       WHERE tenant_id = $1
         AND clinic_id = $2
         AND (first_name ILIKE $3 OR last_name ILIKE $3 OR patient_number ILIKE $3 OR phone ILIKE $3)
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.tenantId, req.user!.clinicId, search]
    );

    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

patientsRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = createPatientSchema.parse(req.body);
    const sequence = await query<{ next: string }>(
      "SELECT count(*)::int + 1 AS next FROM patients WHERE tenant_id = $1",
      [req.user!.tenantId]
    );
    const patientNumber = `HAF-${new Date().getFullYear()}-${String(sequence.rows[0].next).padStart(6, "0")}`;

    const result = await query<{ id: string; patient_number: string }>(
      `INSERT INTO patients (
        tenant_id, clinic_id, patient_number, first_name, last_name, dob, gender, phone, email, address,
        medical_aid_name, emergency_contact_name, emergency_contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, patient_number`,
      [
        req.user!.tenantId,
        req.user!.clinicId,
        patientNumber,
        payload.firstName,
        payload.lastName,
        payload.dob || null,
        payload.gender,
        payload.phone || null,
        payload.email || null,
        payload.address || null,
        payload.medicalAidName || null,
        payload.emergencyContactName || null,
        payload.emergencyContactPhone || null
      ]
    );

    await audit(req.user, "PATIENT_CREATED", "Patient", result.rows[0].id, { patientNumber });
    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

