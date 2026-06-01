import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { authService } from "../src/modules/auth/auth.service";
import { authRepository } from "../src/modules/auth/auth.repository";
import { AppError } from "../src/utils/errors";

jest.mock("../src/modules/auth/auth.repository", () => ({
  authRepository: {
    findEmployeeByEmail: jest.fn(),
    findEmployeeById: jest.fn(),
    updatePassword: jest.fn(),
    createRefreshToken: jest.fn(),
    findActiveRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    findRefreshTokenById: jest.fn()
  }
}));

const mockedAuthRepository = jest.mocked(authRepository);

const activeEmployee = async () => ({
  id: "employee-1",
  firstName: "Ariana",
  lastName: "Santoso",
  email: "admin@staffora.local",
  passwordHash: await bcrypt.hash("Password123!", 12),
  role: Role.SUPER_ADMIN,
  department: "Executive",
  position: "Chief HR Officer",
  leaveBalance: 30,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores refresh token with the same id as the JWT jti", async () => {
    mockedAuthRepository.findEmployeeByEmail.mockResolvedValue(await activeEmployee());
    mockedAuthRepository.createRefreshToken.mockResolvedValue({} as never);

    const result = await authService.login({
      email: "admin@staffora.local",
      password: "Password123!"
    });

    const decodedRefresh = jwt.decode(result.refreshToken) as { jti: string };
    expect(mockedAuthRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id: decodedRefresh.jti,
        employeeId: "employee-1"
      })
    );
  });

  it("rejects login for inactive employees", async () => {
    mockedAuthRepository.findEmployeeByEmail.mockResolvedValue({
      ...(await activeEmployee()),
      isActive: false
    });

    await expect(
      authService.login({
        email: "admin@staffora.local",
        password: "Password123!"
      })
    ).rejects.toMatchObject<Partial<AppError>>({
      message: "Account is inactive",
      statusCode: 403
    });
  });

  it("changes password when the current password is valid", async () => {
    mockedAuthRepository.findEmployeeById.mockResolvedValue(await activeEmployee());
    mockedAuthRepository.updatePassword.mockResolvedValue({} as never);

    await authService.changePassword({
      employeeId: "employee-1",
      currentPassword: "Password123!",
      newPassword: "Password456!"
    });

    expect(mockedAuthRepository.updatePassword).toHaveBeenCalledWith(
      "employee-1",
      expect.any(String)
    );
  });
});
