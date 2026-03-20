import { Router, type IRouter } from "express";
import { SubmitEvaluationBody } from "@workspace/api-zod";
import {
  listEvaluations,
  submitEvaluation,
} from "../lib/data-store";

const router: IRouter = Router();

router.get("/evaluations", async (req, res) => {
  const facultyId = req.query.facultyId
    ? Number.parseInt(req.query.facultyId as string, 10)
    : undefined;

  res.json(await listEvaluations(facultyId));
});

router.post("/evaluations", async (req, res) => {
  const data = SubmitEvaluationBody.parse(req.body);
  res.status(201).json(await submitEvaluation(data));
});

export default router;
