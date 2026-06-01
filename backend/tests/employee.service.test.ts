import { Role } from "@prisma/client";
import { employeeService } from "../src/modules/employee/employee.service";
import { employeeRepository } from "../src/modules/employee/employee.repository";

jest.mock("../src/modules/employee/employee.repository", () => ({
  employeeRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    list: jest.fn()
  }
}));

jest.mock("../src/modules/activity/activity.service", () => ({
  activityService: {
    log: jest.fn()
  }
}));

const mockedEmployeeRepository = jest.mocked(employeeRepository);

const employee = {
  id: "0caa01f1-3205-4a3f-bdbf-6f921c1543d4",
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

describe("employeeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns employee detail by id", async () => {
    mockedEmployeeRepository.findById.mockResolvedValue(employee);

    await expect(employeeService.getById(employee.id)).resolves.toEqual(employee);
  });

  it("rejects updating to an email already used by another employee", async () => {
    mockedEmployeeRepository.findById.mockResolvedValue(employee);
    mockedEmployeeRepository.findByEmail.mockResolvedValue({
      ...employee,
      id: "2e8fdb2e-83b7-4a95-8b1c-dc1d5f753a25",
      email: "taken@staffora.local"
    });

    await expect(
      employeeService.update(employee.id, { email: "taken@staffora.local" })
    ).rejects.toMatchObject({
      message: "Email already in use",
      statusCode: 409
    });
  });
});
