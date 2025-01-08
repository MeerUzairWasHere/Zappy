import { NextFunction, Router, Request, Response } from "express";
import { authenticateUser } from "../middlewares/authentication";

const router = Router();

import {
  createZap,
  getAllZaps,
  getSingleZap,
} from "../controllers/zap.controller";

router.route("/").post(
  (req: Request, res: Response, next: NextFunction) =>
    authenticateUser(req, res, next),
  (req: Request, res: Response, next: NextFunction) => createZap(req, res),
  getAllZaps
);

router.route("/").get(
  (req: Request, res: Response, next: NextFunction) =>
    authenticateUser(req, res, next),
  (req: Request, res: Response, next: NextFunction) => getAllZaps(req, res),
  getAllZaps
);

router.route("/:zapId").get(
  (req: Request, res: Response, next: NextFunction) =>
    authenticateUser(req, res, next),
  (req: Request, res: Response, next: NextFunction) => getAllZaps(req, res),
  getSingleZap
);

export default router;