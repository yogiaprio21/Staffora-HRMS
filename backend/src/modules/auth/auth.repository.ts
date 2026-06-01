import { prisma } from "../../config/prisma";
import { Role } from "@prisma/client";

export const authRepository = {
  createEmployee: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: Role;
    department: string;
    position?: string;
  }) => {
    return prisma.employee.create({ data });
  },
  findEmployeeByEmail: async (email: string) => {
    return prisma.employee.findFirst({
      where: { email, deletedAt: null }
    });
  },
  findEmployeeById: async (id: string) => {
    return prisma.employee.findFirst({
      where: { id, deletedAt: null }
    });
  },
  createRefreshToken: async (data: {
    id: string;
    employeeId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => {
    return prisma.refreshToken.create({ data });
  },
  revokeRefreshToken: async (id: string) => {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  },
  findRefreshTokenById: async (id: string) => {
    return prisma.refreshToken.findUnique({ where: { id } });
  },
  findActiveRefreshToken: async (id: string) => {
    return prisma.refreshToken.findFirst({
      where: { id, revokedAt: null }
    });
  }
};
