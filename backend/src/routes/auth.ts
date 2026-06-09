import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { query } from "../database.js";
import { audit } from "../services/audit.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await query<{
      id: string;
      tenant_id: string;
      clinic_id: string;
      email: string;
      password_hash: string;
      first_name: string;
      last_name: string;
      role: string;
      active: boolean;
    }>(
      `SELECT id, tenant_id, clinic_id, email, password_hash, first_name, last_name, role, active
       FROM users
       WHERE lower(email) = lower($1)
       LIMIT 1`,
      [payload.email]
    );

    const user = result.rows[0];
    const valid = user?.active ? await bcrypt.compare(payload.password, user.password_hash) : false;

    if (!user || !valid) {
      await audit(undefined, "LOGIN_FAILED", "User", undefined, { email: payload.email });
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        tenant_id: user.tenant_id,
        clinic_id: user.clinic_id,
        email: user.email,
        role: user.role
      },
      config.jwtSecret,
      { expiresIn: "8h" }
    );

    await audit(
      {
        id: user.id,
        tenantId: user.tenant_id,
        clinicId: user.clinic_id,
        email: user.email,
        role: user.role as never
      },
      "LOGIN_SUCCESS",
      "User",
      user.id
    );

    return res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          tenantId: user.tenant_id,
          clinicId: user.clinic_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
});

