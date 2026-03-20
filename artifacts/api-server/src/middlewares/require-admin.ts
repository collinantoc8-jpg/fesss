import { type NextFunction, type Request, type Response } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Administrator access required." });
    return;
  }

  next();
}
