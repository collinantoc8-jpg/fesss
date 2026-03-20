import { Router, type IRouter } from "express";
import {
  CreateFacultyBody,
  UpdateFacultyBody,
} from "@workspace/api-zod";
import {
  createFaculty,
  deleteFaculty,
  getFaculty,
  listFaculty,
  updateFaculty,
} from "../lib/data-store";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/faculty", async (_req, res) => {
  res.json(await listFaculty());
});

router.post("/faculty", requireAdmin, async (req, res) => {
  const data = CreateFacultyBody.parse(req.body);
  res.status(201).json(await createFaculty(data));
});

router.get("/faculty/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const faculty = await getFaculty(id);

  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  res.json(faculty);
});

router.put("/faculty/:id", requireAdmin, async (req, res) => {
  const id = Number.parseInt(
    Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    10,
  );
  const data = UpdateFacultyBody.parse(req.body);
  const faculty = await updateFaculty(id, data);

  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  res.json(faculty);
});

router.delete("/faculty/:id", requireAdmin, async (req, res) => {
  const id = Number.parseInt(
    Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    10,
  );
  await deleteFaculty(id);
  res.status(204).send();
});

export default router;
