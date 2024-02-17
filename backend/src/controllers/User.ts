import { NextFunction } from "express";
import { Request, Response } from 'express';
import { User } from "../modals/User.js";
import { newUserRequestBody } from "../types/types.js";

export const newUser = async (
  req: Request<{}, {}, newUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, photo, gender, _id, dob } = req.body;
    const user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  } catch (error) {
    return res.status(400).json({
        success: false,
        message: error,
      });
  }
};
