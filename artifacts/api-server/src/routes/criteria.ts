import { Router, type IRouter } from "express";
import { CreateCriterionBody } from "@workspace/api-zod";
import {
  createCriterion,
  deleteCriterion,
  listCriteria,
} from "../lib/data-store";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/criteria", async (_req, res) => {
  res.json(await listCriteria());
});

router.post("/criteria", requireAdmin, async (req, res) => {
  const data = CreateCriterionBody.parse(req.body);
  res.status(201).json(await createCriterion(data));
});

router.delete("/criteria/:id", requireAdmin, async (req, res) => {
  const id = Number.parseInt(
    Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    10,
  );
  await deleteCriterion(id);
  res.status(204).send();
});

export default router;
