import { Router, type IRouter } from "express";
import { db, criteriaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCriterionBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/criteria", async (_req, res) => {
  const criteria = await db.select().from(criteriaTable).orderBy(criteriaTable.category, criteriaTable.name);
  res.json(criteria);
});

router.post("/criteria", async (req, res) => {
  const data = CreateCriterionBody.parse(req.body);
  const [criterion] = await db.insert(criteriaTable).values(data).returning();
  res.status(201).json(criterion);
});

router.delete("/criteria/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(criteriaTable).where(eq(criteriaTable.id, id));
  res.status(204).send();
});

export default router;
