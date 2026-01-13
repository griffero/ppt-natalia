// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { z as z2 } from "zod";
import path from "path";
import { fileURLToPath } from "url";

// src/env.ts
import { z } from "zod";
var EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().optional(),
  ADMIN_TOKEN: z.string().optional()
});
var env = EnvSchema.parse(process.env);

// src/db.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();

// src/index.ts
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "128kb" }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (!env.FRONTEND_ORIGIN) return cb(null, true);
      return cb(null, origin === env.FRONTEND_ORIGIN);
    },
    credentials: true
  })
);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
app.get("/api/commitments", async (_req, res) => {
  const items = await prisma.commitment.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: { id: true, initials: true, text: true, createdAt: true }
  });
  res.json({ items });
});
var CreateCommitmentSchema = z2.object({
  initials: z2.string().trim().min(1).max(6).transform((s) => s.toUpperCase()),
  commitments: z2.string().trim().min(1).max(800)
});
app.post("/api/commitments", async (req, res) => {
  const parsed = CreateCommitmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_body", issues: parsed.error.issues });
  }
  const created = await prisma.commitment.create({
    data: { initials: parsed.data.initials, text: parsed.data.commitments },
    select: { id: true, initials: true, text: true, createdAt: true }
  });
  res.status(201).json({ item: created });
});
app.delete("/api/commitments", async (req, res) => {
  if (!env.ADMIN_TOKEN) return res.status(404).json({ error: "not_found" });
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (token !== env.ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });
  await prisma.commitment.deleteMany({});
  res.json({ ok: true });
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  return res.sendFile(path.join(publicDir, "index.html"));
});
app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});
