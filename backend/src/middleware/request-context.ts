import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") ?? crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  next();
}

