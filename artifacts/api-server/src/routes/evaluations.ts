import { Router, type IRouter } from "express";
import { db, evaluationsTable, evaluationScoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitEvaluationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/evaluations", async (req, res) => {
  const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined;
  const query = db.select().from(evaluationsTable);
  const evaluations = facultyId
    ? await query.where(eq(evaluationsTable.facultyId, facultyId)).orderBy(evaluationsTable.createdAt)
    : await query.orderBy(evaluationsTable.createdAt);
  res.json(evaluations);
});

router.post("/evaluations", async (req, res) => {
  const data = SubmitEvaluationBody.parse(req.body);
  const { scores, ...evalData } = data;

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

  const [evaluation] = await db
    .insert(evaluationsTable)
    .values({ ...evalData, totalScore, comments: evalData.comments ?? null })
    .returning();

  if (scores.length > 0) {
    await db.insert(evaluationScoresTable).values(
      scores.map((s) => ({
        evaluationId: evaluation.id,
        criterionId: s.criterionId,
        score: s.score,
      }))
    );
  }

  res.status(201).json(evaluation);
});

export default router;
