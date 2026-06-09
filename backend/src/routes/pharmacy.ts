import { Router } from "express";
import { query } from "../database.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types.js";

export const pharmacyRouter = Router();

pharmacyRouter.use(requireAuth);

pharmacyRouter.get("/medications", async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await query(
      `SELECT id, generic_name, brand_name, strength, quantity_on_hand, reorder_threshold, expiry_date
       FROM medications
       WHERE tenant_id = $1
       ORDER BY generic_name ASC`,
      [req.user!.tenantId]
    );

    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

pharmacyRouter.get("/alerts", async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await query(
      `SELECT id, generic_name, brand_name, strength, quantity_on_hand, reorder_threshold, expiry_date
       FROM medications
       WHERE tenant_id = $1
         AND (quantity_on_hand <= reorder_threshold OR expiry_date <= CURRENT_DATE + INTERVAL '90 days')
       ORDER BY expiry_date ASC NULLS LAST`,
      [req.user!.tenantId]
    );

    return res.json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

