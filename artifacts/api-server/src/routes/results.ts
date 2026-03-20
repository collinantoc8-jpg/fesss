import { Router, type IRouter } from "express";
import {
  getFacultyResult,
  listAcademicYears,
  listResults,
} from "../lib/data-store";

const router: IRouter = Router();

router.get("/academic-years", async (_req, res) => {
  res.json(await listAcademicYears());
});

router.get("/results", async (req, res) => {
  const academicYear = req.query.academicYear as string | undefined;
  const semester = req.query.semester as string | undefined;
  res.json(await listResults(academicYear, semester));
});

router.get("/results/:facultyId", async (req, res) => {
  const facultyId = Number.parseInt(req.params.facultyId, 10);
  const result = await getFacultyResult(facultyId);

  if (!result) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  res.json(result);
});

export default router;
