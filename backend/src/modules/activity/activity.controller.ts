import { Request, Response } from "express";
import { activityService } from "./activity.service";
import { sendResponse } from "../../utils/response";
import { createPaginationMeta } from "../../utils/pagination";

export const activityController = {
  list: async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const activity = await activityService.list({
      page,
      limit,
      action: req.query.action as string | undefined,
      entityType: req.query.entityType as string | undefined,
      search: req.query.search as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined
    });
    return sendResponse(res, 200, "Activity fetched", {
      items: activity.items,
      meta: createPaginationMeta({ page, limit, total: activity.total })
    });
  },
  exportCsv: async (req: Request, res: Response) => {
    const activity = await activityService.list({
      page: 1,
      limit: 1000,
      action: req.query.action as string | undefined,
      entityType: req.query.entityType as string | undefined,
      search: req.query.search as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined
    });
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["createdAt", "action", "entityType", "entityId", "message", "actorId", "targetEmployeeId"],
      ...activity.items.map((item) => [
        item.createdAt.toISOString(),
        item.action,
        item.entityType,
        item.entityId,
        item.message,
        item.actorId || "",
        item.targetEmployeeId || ""
      ])
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=activity-log.csv");
    return res.send(rows.map((row) => row.map(escape).join(",")).join("\n"));
  }
};
