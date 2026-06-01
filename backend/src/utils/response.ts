import { Response } from "express";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  const payload: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(payload);
};
