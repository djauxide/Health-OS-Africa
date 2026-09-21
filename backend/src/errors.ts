import type { NextFunction, Request, RequestHandler, Response } from "express";
export class AppError extends Error { constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); } }
export const ah = (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
