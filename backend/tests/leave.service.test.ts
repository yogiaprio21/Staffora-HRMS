import { LeaveStatus, Role } from "@prisma/client";
import { leaveService } from "../src/modules/leave/leave.service";
import { leaveRepository } from "../src/modules/leave/leave.repository";

jest.mock("../src/modules/leave/leave.repository", () => ({
  leaveRepository: {
    findActiveEmployeeById: jest.fn(),
    findOverlappingRequest: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    approveWithBalanceDeduction: jest.fn(),
    reject: jest.fn(),
    list: jest.fn()
  }
}));

jest.mock("../src/modules/activity/activity.service", () => ({
  activityService: {
    log: jest.fn()
  }
}));

const mockedLeaveRepository = jest.mocked(leaveRepository);

const employee = {
  id: "employee-1",
  firstName: "Emma",
  lastName: "Putri",
  email: "emma@staffora.local",
  passwordHash: "hash",
  role: Role.EMPLOYEE,
  department: "Engineering",
  position: "Backend Engineer",
  leaveBalance: 20,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const pendingLeave = {
  id: "leave-1",
  employeeId: "employee-1",
  employee,
  startDate: new Date("2026-06-10"),
  endDate: new Date("2026-06-12"),
  reason: "Annual leave",
  status: LeaveStatus.PENDING,
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  reviewNote: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe("leaveService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects overlapping leave requests", async () => {
    mockedLeaveRepository.findActiveEmployeeById.mockResolvedValue(employee);
    mockedLeaveRepository.findOverlappingRequest.mockResolvedValue(pendingLeave);

    await expect(
      leaveService.submit({
        requesterId: "employee-1",
        requesterRole: Role.EMPLOYEE,
        startDate: "2026-06-11",
        endDate: "2026-06-13",
        reason: "Family event"
      })
    ).rejects.toMatchObject({
      message: "Leave request overlaps with an existing request",
      statusCode: 409
    });
  });

  it("prevents approvers from approving their own leave request", async () => {
    mockedLeaveRepository.findById.mockResolvedValue(pendingLeave);

    await expect(leaveService.approve("leave-1", "employee-1")).rejects.toMatchObject({
      message: "Approvers cannot approve their own leave request",
      statusCode: 403
    });
  });

  it("approves leave through the atomic repository operation", async () => {
    mockedLeaveRepository.findById.mockResolvedValue(pendingLeave);
    mockedLeaveRepository.approveWithBalanceDeduction.mockResolvedValue({
      ...pendingLeave,
      employee,
      status: LeaveStatus.APPROVED,
      approvedBy: "hr-1",
      approvedAt: new Date()
    });

    await leaveService.approve("leave-1", "hr-1");

    expect(mockedLeaveRepository.approveWithBalanceDeduction).toHaveBeenCalledWith({
      id: "leave-1",
      employeeId: "employee-1",
      approvedBy: "hr-1",
      days: 3,
      reviewNote: undefined
    });
  });
});
