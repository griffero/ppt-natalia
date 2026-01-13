import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./env.js";
import { prisma } from "./db.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "128kb" }));

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients or same-origin
      if (!origin) return cb(null, true);
      if (!env.FRONTEND_ORIGIN) return cb(null, true);
      return cb(null, origin === env.FRONTEND_ORIGIN);
    },
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/commitments", async (_req, res) => {
  const items = await prisma.commitment.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: { id: true, initials: true, text: true, createdAt: true },
  });
  res.json({ items });
});

const CreateCommitmentSchema = z.object({
  initials: z
    .string()
    .trim()
    .min(1)
    .max(6)
    .transform((s) => s.toUpperCase()),
  commitments: z.string().trim().min(1).max(800),
});

app.post("/api/commitments", async (req, res) => {
  const parsed = CreateCommitmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_body", issues: parsed.error.issues });
  }

  const created = await prisma.commitment.create({
    data: { initials: parsed.data.initials, text: parsed.data.commitments },
    select: { id: true, initials: true, text: true, createdAt: true },
  });

  res.status(201).json({ item: created });
});

// Optional admin endpoint to reset the wall between sessions.
app.delete("/api/commitments", async (req, res) => {
  if (!env.ADMIN_TOKEN) return res.status(404).json({ error: "not_found" });
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (token !== env.ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });

  await prisma.commitment.deleteMany({});
  res.json({ ok: true });
});

// Serve the built Vue app (built into backend/public) in production.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  return res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.PORT}`);
});


