import { Router, type IRouter } from "express";
import { db, facultyTable, evaluationsTable, evaluationScoresTable, criteriaTable } from "@workspace/db";
import { eq, avg, count, sql, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/academic-years", async (_req, res) => {
  const rows = await db
    .selectDistinct({ academicYear: evaluationsTable.academicYear })
    .from(evaluationsTable)
    .orderBy(sql`${evaluationsTable.academicYear} DESC`);
  res.json(rows.map(r => r.academicYear));
});

router.get("/results", async (req, res) => {
  const academicYear = req.query.academicYear as string | undefined;
  const semester = req.query.semester as string | undefined;

  const faculty = await db.select().from(facultyTable).orderBy(facultyTable.name);
  const totalCriteria = await db.select({ total: count() }).from(criteriaTable);
  const maxPossiblePerEval = (totalCriteria[0]?.total ?? 0) * 5;

  const results = await Promise.all(
    faculty.map(async (f) => {
      const conditions = [eq(evaluationsTable.facultyId, f.id)];
      if (academicYear) conditions.push(eq(evaluationsTable.academicYear, academicYear));
      if (semester) conditions.push(eq(evaluationsTable.semester, semester));

      const evals = await db
        .select({ count: count(), avgScore: avg(evaluationsTable.totalScore) })
        .from(evaluationsTable)
        .where(and(...conditions));

      const totalEvals = Number(evals[0]?.count ?? 0);
      const avgScore = Number(evals[0]?.avgScore ?? 0);
      const overallPercentage = maxPossiblePerEval > 0 ? (avgScore / maxPossiblePerEval) * 100 : 0;

      return {
        facultyId: f.id,
        facultyName: f.name,
        department: f.department,
        position: f.position,
        averageScore: avgScore,
        totalEvaluations: totalEvals,
        overallPercentage: Math.round(overallPercentage * 10) / 10,
      };
    })
  );

  results.sort((a, b) => b.overallPercentage - a.overallPercentage);
  res.json(results);
});

router.get("/results/:facultyId", async (req, res) => {
  const facultyId = parseInt(req.params.facultyId);

  const [faculty] = await db.select().from(facultyTable).where(eq(facultyTable.id, facultyId));
  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  const evals = await db
    .select({ count: count(), avgScore: avg(evaluationsTable.totalScore) })
    .from(evaluationsTable)
    .where(eq(evaluationsTable.facultyId, facultyId));

  const criteria = await db.select().from(criteriaTable);

  const criteriaScores = await Promise.all(
    criteria.map(async (c) => {
      const scores = await db
        .select({ avg: avg(evaluationScoresTable.score) })
        .from(evaluationScoresTable)
        .innerJoin(evaluationsTable, eq(evaluationScoresTable.evaluationId, evaluationsTable.id))
        .where(
          sql`${evaluationsTable.facultyId} = ${facultyId} AND ${evaluationScoresTable.criterionId} = ${c.id}`
        );

      return {
        criterionId: c.id,
        criterionName: c.name,
        category: c.category,
        averageScore: Math.round(Number(scores[0]?.avg ?? 0) * 10) / 10,
        maxScore: c.maxScore,
      };
    })
  );

  const recentComments = await db
    .select({ comments: evaluationsTable.comments })
    .from(evaluationsTable)
    .where(eq(evaluationsTable.facultyId, facultyId))
    .orderBy(sql`${evaluationsTable.createdAt} DESC`)
    .limit(5);

  const totalCriteria = criteria.length;
  const maxPossiblePerEval = totalCriteria * 5;
  const avgScore = Number(evals[0]?.avgScore ?? 0);
  const overallPercentage = maxPossiblePerEval > 0 ? (avgScore / maxPossiblePerEval) * 100 : 0;

  res.json({
    facultyId: faculty.id,
    facultyName: faculty.name,
    department: faculty.department,
    position: faculty.position,
    averageScore: avgScore,
    totalEvaluations: Number(evals[0]?.count ?? 0),
    overallPercentage: Math.round(overallPercentage * 10) / 10,
    criteriaScores,
    recentComments: recentComments.map((r) => r.comments).filter(Boolean) as string[],
  });
});

export default router;
