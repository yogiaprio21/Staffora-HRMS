import jwt from "jsonwebtoken";
import request from "supertest";
import { Role } from "@prisma/client";
import { createApp } from "../src/app";
import { authService } from "../src/modules/auth/auth.service";
import { employeeService } from "../src/modules/employee/employee.service";

jest.mock("../src/modules/auth/auth.service", () => ({
  authService: {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn()
  }
}));

jest.mock("../src/modules/employee/employee.service", () => ({
  employeeService: {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    departments: jest.fn(),
    summary: jest.fn()
  }
}));

jest.mock("../src/modules/leave/leave.service", () => ({
  leaveService: {
    submit: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    list: jest.fn()
  }
}));

const app = createApp();
const token = jwt.sign(
  { sub: "0caa01f1-3205-4a3f-bdbf-6f921c1543d4", role: Role.HR },
  process.env.JWT_ACCESS_SECRET || "test-access-secret"
);

const employee = {
  id: "0caa01f1-3205-4a3f-bdbf-6f921c1543d4",
  firstName: "Rafi",
  lastName: "Pratama",
  email: "hr@staffora.local",
  role: Role.HR,
  department: "HR",
  position: "HR Manager",
  leaveBalance: 25,
  isActive: true
};

describe("api routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exposes a health endpoint for hosting probes", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns the authenticated employee from /auth/me", async () => {
    jest.mocked(authService.me).mockResolvedValue({
      ...employee,
      passwordHash: "hash",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("hr@staffora.local");
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it("returns employee pagination metadata", async () => {
    jest.mocked(employeeService.list).mockResolvedValue({
      items: [
        {
          ...employee,
          passwordHash: "hash",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      total: 1
    });

    const response = await request(app)
      .get("/api/v1/employees?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1
    });
  });

  it("requires a rejection note when rejecting leave", async () => {
    const response = await request(app)
      .patch("/api/v1/leaves/0caa01f1-3205-4a3f-bdbf-6f921c1543d4/reject")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });
});
