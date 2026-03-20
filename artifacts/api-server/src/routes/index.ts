import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import departmentsRouter from "./departments";
import facultyRouter from "./faculty";
import criteriaRouter from "./criteria";
import evaluationsRouter from "./evaluations";
import resultsRouter from "./results";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(departmentsRouter);
router.use(facultyRouter);
router.use(criteriaRouter);
router.use(evaluationsRouter);
router.use(resultsRouter);

export default router;
