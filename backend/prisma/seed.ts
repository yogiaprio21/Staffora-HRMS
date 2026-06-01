import { LeaveStatus, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const departments = [
  { name: "Human Resources", positions: ["HR Manager", "People Partner", "Recruiter", "Payroll Specialist"] },
  { name: "Engineering", positions: ["Frontend Engineer", "Backend Engineer", "QA Engineer", "DevOps Engineer"] },
  { name: "Finance", positions: ["Finance Analyst", "Accountant", "Tax Specialist", "Budget Controller"] },
  { name: "Sales", positions: ["Account Executive", "Sales Lead", "Business Development", "Sales Operations"] },
  { name: "Marketing", positions: ["Content Strategist", "Brand Specialist", "Growth Marketer", "Campaign Manager"] },
  { name: "Operations", positions: ["Operations Analyst", "Office Manager", "Procurement Officer", "Process Lead"] },
  { name: "Product", positions: ["Product Manager", "Product Analyst", "Scrum Master", "Product Owner"] },
  { name: "Legal", positions: ["Legal Officer", "Compliance Specialist", "Contract Analyst", "Risk Officer"] },
  { name: "Customer Support", positions: ["Support Specialist", "Customer Success", "Helpdesk Lead", "Support Analyst"] },
  { name: "Design", positions: ["UI Designer", "UX Researcher", "Product Designer", "Design System Lead"] }
];

const firstNames = [
  "Ariana", "Rafi", "Emma", "Liam", "Sophia", "Dewi", "Bima", "Nadia", "Raka", "Maya",
  "Arif", "Sinta", "Dimas", "Putri", "Fajar", "Citra", "Bagas", "Nabila", "Reno", "Alya",
  "Yoga", "Intan", "Farhan", "Kirana", "Hana", "Gilang", "Tania", "Rizky", "Dinda", "Aditya"
];

const lastNames = [
  "Santoso", "Pratama", "Putri", "Haryanto", "Wijaya", "Nugroho", "Saputra", "Lestari",
  "Ramadhan", "Permata", "Maulana", "Puspita", "Wibowo", "Cahyani", "Kurniawan", "Safitri",
  "Firmansyah", "Anggraini", "Setiawan", "Mahendra"
];

const reasons = [
  "Cuti tahunan untuk kebutuhan keluarga",
  "Istirahat kesehatan sesuai rekomendasi dokter",
  "Mengurus keperluan administrasi pribadi",
  "Menghadiri acara keluarga di luar kota",
  "Cuti singkat untuk pemulihan kondisi tubuh",
  "Rencana liburan tahunan yang sudah dijadwalkan"
];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildEmployeeData = async () => {
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const employees = [];

  for (let index = 0; index < 100; index += 1) {
    const department = departments[index % departments.length];
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3) % lastNames.length];
    const role =
      index === 0 ? Role.SUPER_ADMIN : index <= 7 ? Role.HR : Role.EMPLOYEE;
    const isArchived = index === 99;
    const isInactive = index % 19 === 0 && index > 7;

    employees.push({
      firstName,
      lastName,
      email:
        index === 0
          ? "admin@staffora.local"
          : index === 1
            ? "hr@staffora.local"
            : index === 2
              ? "emma@staffora.local"
              : `employee${String(index + 1).padStart(3, "0")}@staffora.local`,
      passwordHash,
      role,
      department: department.name,
      position: department.positions[index % department.positions.length],
      leaveBalance: 12 + (index % 15),
      isActive: !isInactive && !isArchived,
      deletedAt: isArchived ? addDays(new Date(), -45) : null
    });
  }

  return employees;
};

const seedEmployees = async () => {
  const employeeData = await buildEmployeeData();
  const employees = [];

  for (const data of employeeData) {
    employees.push(await prisma.employee.create({ data }));
  }

  return employees;
};

const seedLeaves = async (employees: Awaited<ReturnType<typeof seedEmployees>>) => {
  const hr = employees.find((employee) => employee.role === Role.HR)!;
  const admin = employees.find((employee) => employee.role === Role.SUPER_ADMIN)!;
  const activeEmployees = employees.filter(
    (employee) => employee.role === Role.EMPLOYEE && employee.isActive && !employee.deletedAt
  );
  const statuses = [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED];
  const createdLeaves = [];

  for (let index = 0; index < activeEmployees.length; index += 1) {
    const employee = activeEmployees[index];
    const status = statuses[index % statuses.length];
    const startDate = addDays(new Date("2026-06-03T00:00:00.000Z"), index - 35);
    const duration = (index % 4) + 1;
    const endDate = addDays(startDate, duration - 1);

    createdLeaves.push(
      await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          startDate,
          endDate,
          reason: reasons[index % reasons.length],
          status,
          approvedBy: status === LeaveStatus.APPROVED ? (index % 2 === 0 ? hr.id : admin.id) : null,
          approvedAt: status === LeaveStatus.APPROVED ? addDays(startDate, -5) : null,
          rejectedBy: status === LeaveStatus.REJECTED ? hr.id : null,
          rejectedAt: status === LeaveStatus.REJECTED ? addDays(startDate, -4) : null,
          reviewNote:
            status === LeaveStatus.APPROVED
              ? "Disetujui berdasarkan ketersediaan jadwal tim."
              : status === LeaveStatus.REJECTED
                ? "Periode bentrok dengan kebutuhan operasional tim."
                : null
        }
      })
    );

    if (index % 5 === 0) {
      const nextStartDate = addDays(new Date("2026-08-01T00:00:00.000Z"), index);
      createdLeaves.push(
        await prisma.leaveRequest.create({
          data: {
            employeeId: employee.id,
            startDate: nextStartDate,
            endDate: addDays(nextStartDate, 1),
            reason: "Rencana cuti lanjutan untuk agenda keluarga",
            status: LeaveStatus.PENDING
          }
        })
      );
    }
  }

  return createdLeaves;
};

const seedActivityLogs = async (
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  leaves: Awaited<ReturnType<typeof seedLeaves>>
) => {
  const actor = employees.find((employee) => employee.role === Role.HR) || employees[0];

  await prisma.activityLog.createMany({
    data: [
      ...employees.slice(0, 35).map((employee, index) => ({
        action: index % 6 === 0 ? "EMPLOYEE_UPDATED" : "EMPLOYEE_CREATED",
        entityType: "Employee",
        entityId: employee.id,
        actorId: actor.id,
        targetEmployeeId: employee.id,
        message:
          index % 6 === 0
            ? `Profil ${employee.firstName} ${employee.lastName} diperbarui`
            : `${employee.firstName} ${employee.lastName} ditambahkan ke Staffora`,
        metadata: { department: employee.department, role: employee.role },
        createdAt: addDays(new Date(), -index)
      })),
      ...leaves.slice(0, 45).map((leave, index) => ({
        action:
          leave.status === LeaveStatus.APPROVED
            ? "LEAVE_APPROVED"
            : leave.status === LeaveStatus.REJECTED
              ? "LEAVE_REJECTED"
              : "LEAVE_SUBMITTED",
        entityType: "LeaveRequest",
        entityId: leave.id,
        actorId: actor.id,
        targetEmployeeId: leave.employeeId,
        message:
          leave.status === LeaveStatus.APPROVED
            ? "Pengajuan cuti disetujui"
            : leave.status === LeaveStatus.REJECTED
              ? "Pengajuan cuti ditolak"
              : "Pengajuan cuti baru menunggu persetujuan",
        metadata: { status: leave.status },
        createdAt: addDays(new Date(), -(index % 21))
      }))
    ]
  });
};

const seedNotifications = async (
  employees: Awaited<ReturnType<typeof seedEmployees>>,
  leaves: Awaited<ReturnType<typeof seedLeaves>>
) => {
  const reviewers = employees.filter(
    (employee) => employee.role === Role.SUPER_ADMIN || employee.role === Role.HR
  );
  const pendingLeaves = leaves.filter((leave) => leave.status === LeaveStatus.PENDING).slice(0, 18);
  const approvedLeaves = leaves.filter((leave) => leave.status === LeaveStatus.APPROVED).slice(0, 18);
  const rejectedLeaves = leaves.filter((leave) => leave.status === LeaveStatus.REJECTED).slice(0, 12);

  await prisma.notification.createMany({
    data: [
      ...reviewers.flatMap((reviewer) =>
        pendingLeaves.slice(0, 8).map((leave, index) => ({
          userId: reviewer.id,
          title: "Pengajuan cuti menunggu persetujuan",
          description: `Ada pengajuan cuti baru yang perlu ditinjau HR (${index + 1}).`,
          href: "/leave-approvals?status=PENDING",
          tone: "warning",
          readAt: index % 3 === 0 ? new Date() : null,
          createdAt: addDays(new Date(), -index)
        }))
      ),
      ...approvedLeaves.map((leave, index) => ({
        userId: leave.employeeId,
        title: "Cuti disetujui",
        description: "Pengajuan cuti Anda telah disetujui.",
        href: "/profile",
        tone: "success",
        readAt: index % 2 === 0 ? new Date() : null,
        createdAt: addDays(new Date(), -index)
      })),
      ...rejectedLeaves.map((leave, index) => ({
        userId: leave.employeeId,
        title: "Cuti ditolak",
        description: "Pengajuan cuti Anda belum dapat disetujui. Lihat catatan review.",
        href: "/profile",
        tone: "danger",
        readAt: index % 2 === 1 ? new Date() : null,
        createdAt: addDays(new Date(), -index)
      }))
    ]
  });
};

const seedRefreshTokens = async (employeeIds: string[]) => {
  const expiresAt = addDays(new Date(), 7);
  for (const employeeId of employeeIds) {
    const rawToken = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 12);
    await prisma.refreshToken.create({
      data: {
        employeeId,
        tokenHash,
        expiresAt
      }
    });
  }
};

const resetDatabase = async () => {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.employee.deleteMany();
};

const main = async () => {
  await resetDatabase();
  const employees = await seedEmployees();
  const leaves = await seedLeaves(employees);
  await seedActivityLogs(employees, leaves);
  await seedNotifications(employees, leaves);
  await seedRefreshTokens(employees.slice(0, 8).map((employee) => employee.id));

  console.log(`Seed complete: ${employees.length} employees, ${leaves.length} leave requests.`);
};

main()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
