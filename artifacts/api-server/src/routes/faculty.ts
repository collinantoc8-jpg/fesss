import { Router, type IRouter } from "express";
import { db, facultyTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateFacultyBody,
  UpdateFacultyBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faculty", async (_req, res) => {
  const faculty = await db.select().from(facultyTable).orderBy(facultyTable.name);
  res.json(faculty);
});

router.post("/faculty", async (req, res) => {
  const data = CreateFacultyBody.parse(req.body);
  const [faculty] = await db.insert(facultyTable).values(data).returning();
  res.status(201).json(faculty);
});

router.get("/faculty/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [faculty] = await db.select().from(facultyTable).where(eq(facultyTable.id, id));
  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }
  res.json(faculty);
});

router.put("/faculty/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateFacultyBody.parse(req.body);
  const [faculty] = await db.update(facultyTable).set(data).where(eq(facultyTable.id, id)).returning();
  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }
  res.json(faculty);
});

router.delete("/faculty/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(facultyTable).where(eq(facultyTable.id, id));
  res.status(204).send();
});

export default router;
