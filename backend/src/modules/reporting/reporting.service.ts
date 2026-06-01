import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { reportingRepository } from "./reporting.repository";
import { LeaveStatus, Role } from "@prisma/client";

const formatDate = (date = new Date()) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  EMPLOYEE: "Karyawan"
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak"
};

const drawEmployeeRow = (
  doc: PDFKit.PDFDocument,
  y: number,
  values: string[],
  widths: number[],
  isHeader = false
) => {
  const rowHeight = 26;
  let x = doc.page.margins.left;
  doc
    .rect(x, y, widths.reduce((total, width) => total + width, 0), rowHeight)
    .fill(isHeader ? "#eef2ff" : "#ffffff")
    .stroke("#cbd5e1");
  values.forEach((value, index) => {
    doc
      .fillColor(isHeader ? "#312e81" : "#0f172a")
      .font(isHeader ? "Helvetica-Bold" : "Helvetica")
      .fontSize(isHeader ? 8 : 7)
      .text(value, x + 5, y + 8, { width: widths[index] - 10, ellipsis: true });
    x += widths[index];
  });
  return y + rowHeight;
};

export const reportingService = {
  generateEmployeePdf: async (filters: {
    search?: string;
    department?: string;
    role?: Role;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
  }) => {
    const employees = await reportingRepository.listEmployees(filters);

    const doc = new PDFDocument({ margin: 36, size: "A4", bufferPages: true });
    const widths = [26, 102, 132, 86, 62, 78, 44];
    let y = 132;

    doc.rect(0, 0, doc.page.width, 92).fill("#020617");
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Staffora HRMS", 36, 30)
      .font("Helvetica")
      .fontSize(9)
      .text("Laporan Data Karyawan", 36, 58);
    doc
      .fillColor("#475569")
      .fontSize(8)
      .text(`Tanggal cetak: ${formatDate()}`, 36, 106)
      .text(`Total data: ${employees.length}`, 380, 106, { align: "right" });

    y = drawEmployeeRow(
      doc,
      y,
      ["No", "Nama", "Email", "Departemen", "Peran", "Jabatan", "Cuti"],
      widths,
      true
    );

    employees.forEach((employee, index) => {
      if (y > doc.page.height - 72) {
        doc.addPage();
        y = 48;
        y = drawEmployeeRow(
          doc,
          y,
          ["No", "Nama", "Email", "Departemen", "Peran", "Jabatan", "Cuti"],
          widths,
          true
        );
      }
      y = drawEmployeeRow(doc, y, [
        String(index + 1),
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        employee.department,
        roleLabel[employee.role] || employee.role,
        employee.position || "-",
        String(employee.leaveBalance)
      ], widths);
    });

    const pageCount = doc.bufferedPageRange().count;
    for (let index = 0; index < pageCount; index += 1) {
      doc.switchToPage(index);
      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text(`Halaman ${index + 1} dari ${pageCount}`, 36, doc.page.height - 42, {
          align: "right"
        });
    }

    doc.end();
    return doc;
  },
  generateLeaveExcel: async (filters: {
    status?: LeaveStatus;
    employeeId?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const leaves = await reportingRepository.listLeavesWithEmployees({
      status: filters.status,
      employeeId: filters.employeeId,
      department: filters.department,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Cuti");
    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").value = "Staffora HRMS - Laporan Cuti";
    worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF020617" } };
    worksheet.getCell("A1").alignment = { vertical: "middle" };
    worksheet.getRow(1).height = 28;
    worksheet.addRow([`Tanggal cetak: ${formatDate()}`]);
    worksheet.addRow([]);
    worksheet.columns = [
      { key: "employee", width: 30 },
      { key: "department", width: 20 },
      { key: "startDate", width: 20 },
      { key: "endDate", width: 20 },
      { key: "status", width: 15 },
      { key: "reason", width: 42 },
      { key: "reviewNote", width: 42 }
    ];
    worksheet.getRow(3).values = [
      "Karyawan",
      "Departemen",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Status",
      "Alasan",
      "Catatan Review"
    ];
    worksheet.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
    worksheet.getRow(3).alignment = { vertical: "middle" };
    worksheet.getRow(3).height = 22;

    leaves.forEach((leave) => {
      worksheet.addRow({
        employee: `${leave.employee.firstName} ${leave.employee.lastName}`,
        department: leave.employee.department,
        startDate: formatDate(leave.startDate),
        endDate: formatDate(leave.endDate),
        status: statusLabel[leave.status] || leave.status,
        reason: leave.reason,
        reviewNote: leave.reviewNote || ""
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };
        cell.alignment = { vertical: "top", wrapText: true };
      });
      if (rowNumber > 3) {
        row.height = 24;
      }
    });
    worksheet.autoFilter = "A3:G3";

    return workbook;
  }
};
