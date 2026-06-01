import { Request, Response } from "express";
import { reportingService } from "./reporting.service";
import { LeaveStatus, Role } from "@prisma/client";

const reportDate = () => new Date().toISOString().slice(0, 10);

export const reportingController = {
  exportEmployeesPdf: async (req: Request, res: Response) => {
    const pdf = await reportingService.generateEmployeePdf({
      search: req.query.search as string | undefined,
      department: req.query.department as string | undefined,
      role: req.query.role as Role | undefined,
      status: req.query.status as "ACTIVE" | "INACTIVE" | "ALL" | undefined
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=employees-${reportDate()}.pdf`);
    pdf.pipe(res);
  },
  exportLeavesExcel: async (req: Request, res: Response) => {
    const workbook = await reportingService.generateLeaveExcel({
      status: req.query.status as LeaveStatus | undefined,
      employeeId: req.query.employeeId as string | undefined,
      department: req.query.department as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=leave-report-${reportDate()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }
};
