import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { UnauthenticatedError } from "../errors";

import { prismaClient } from "../db";

export const getAvailableTrigger = async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ msg: "Get Available Trigger" });
};
