import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { sendResponse } from "../../utils/response";

export const dashboardController = {
  stats: async (req: Request, res: Response) => {
    const stats = await dashboardService.stats({
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined
    });
    return sendResponse(res, 200, "Dashboard stats", stats);
  }
};
