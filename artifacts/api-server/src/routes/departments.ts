import { Router, type IRouter } from "express";
import { CreateDepartmentBody, UpdateDepartmentBody } from "@workspace/api-zod";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from "../lib/data-store";

const router: IRouter = Router();

router.get("/departments", async (_req, res) => {
  res.json(await listDepartments());
});

router.post("/departments", async (req, res) => {
  const data = CreateDepartmentBody.parse(req.body);
  res.status(201).json(await createDepartment(data));
});

router.put("/departments/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const data = UpdateDepartmentBody.parse(req.body);
  const department = await updateDepartment(id, data);

  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  res.json(department);
});

router.delete("/departments/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  await deleteDepartment(id);
  res.status(204).send();
});

export default router;
