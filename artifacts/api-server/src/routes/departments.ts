import { Router, type IRouter } from "express";
import { db, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateDepartmentBody, UpdateDepartmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments", async (_req, res) => {
  const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  res.json(departments);
});

router.post("/departments", async (req, res) => {
  const data = CreateDepartmentBody.parse(req.body);
  const [department] = await db.insert(departmentsTable).values({
    name: data.name,
    code: data.code,
    description: data.description ?? null,
  }).returning();
  res.status(201).json(department);
});

router.put("/departments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateDepartmentBody.parse(req.body);
  const [department] = await db.update(departmentsTable).set({
    name: data.name,
    code: data.code,
    description: data.description ?? null,
  }).where(eq(departmentsTable.id, id)).returning();
  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(department);
});

router.delete("/departments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
  res.status(204).send();
});

export default router;
