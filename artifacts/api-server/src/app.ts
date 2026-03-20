import { existsSync } from "fs";
import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

function resolveClientDistDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "artifacts", "faculty-eval", "dist", "public"),
    path.resolve(process.cwd(), "..", "faculty-eval", "dist", "public"),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  return null;
}

const clientDistDir = resolveClientDistDir();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (clientDistDir) {
  app.use(express.static(clientDistDir));
  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(clientDistDir, "index.html"));
  });
} else {
  logger.info("Frontend build not found; API-only mode enabled");
}

export default app;
