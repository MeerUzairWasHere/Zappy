import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

import { prismaClient } from "../db";
import { CreateAvailableActionInput } from "../types";
import { InternalServerError, NotFoundError } from "../errors";
import { FirebaseImageHandler } from "../middlewares/firebaseUploader";

export const createAvailableAction = async (
  req: Request<{}, {}, CreateAvailableActionInput>,
  res: Response
) => {
  let { name, image } = req.body;

  if (req.file) {
    const res = await FirebaseImageHandler.uploadImage(req.file);
    if (!res) {
      throw new InternalServerError("Error uploading image");
    }
    image = res?.downloadURL;
  }

  const action = await prismaClient.availableAction.create({
    data: {
      name,
      image,
    },
  });

  res.status(StatusCodes.OK).json({ action });
};

export const getAvailableAction = async (req: Request, res: Response) => {
  const availableActions = await prismaClient.availableAction.findMany({});

  res.status(StatusCodes.OK).json({ availableActions });
};

export const updateAvailableAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { name, image } = req.body;
  const exists = await prismaClient.availableAction.findFirst({
    where: { id },
  });

  if (!exists) {
    throw new NotFoundError(`Available Action with id: ${id} does not exists!`);
  }

  if (req.file) {
    const res = await FirebaseImageHandler.updateImage({
      oldImageUrl: image,
      newImage: req.file,
    });
    if (!res) {
      throw new InternalServerError("Unable to update image.");
    }
    image = res.downloadURL;
  }

  const availableActions = await prismaClient.availableAction.update({
    where: {
      id,
    },
    data: {
      name,
      image,
    },
  });

  res.status(StatusCodes.OK).json({ availableActions });
};

export const deleteAvailableAction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const exists = await prismaClient.availableAction.findFirst({
    where: { id },
  });

  if (!exists) {
    throw new NotFoundError(`Available Action with id: ${id} does not exists!`);
  }

  await prismaClient.availableAction.delete({
    where: {
      id,
    },
  });
  
  await FirebaseImageHandler.deleteImage(exists?.image!);

  res
    .status(StatusCodes.OK)
    .json({ msg: `Available Action with id: ${id} is deleted successfully!` });
};
