import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { authRepository } from "./auth.repository";
import { Role } from "@prisma/client";

const createAccessToken = (payload: { sub: string; role: Role }) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

const createRefreshToken = (payload: { sub: string; role: Role; jti: string }) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

const getTokenExpiry = (token: string) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new AppError("Invalid refresh token", 401);
  }
  return new Date(decoded.exp * 1000);
};

export const authService = {
  registerEmployee: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    department: string;
    position?: string;
  }) => {
    const existing = await authRepository.findEmployeeByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    return authRepository.createEmployee({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: data.role,
      department: data.department,
      position: data.position
    });
  },
  login: async (data: { email: string; password: string }) => {
    const employee = await authRepository.findEmployeeByEmail(data.email);
    if (!employee) {
      throw new AppError("Invalid credentials", 401);
    }
    if (!employee.isActive) {
      throw new AppError("Account is inactive", 403);
    }
    const valid = await bcrypt.compare(data.password, employee.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const accessToken = createAccessToken({ sub: employee.id, role: employee.role });
    const refreshId = crypto.randomUUID();
    const refreshToken = createRefreshToken({
      sub: employee.id,
      role: employee.role,
      jti: refreshId
    });
    const tokenHash = await bcrypt.hash(refreshToken, 12);
    await authRepository.createRefreshToken({
      id: refreshId,
      employeeId: employee.id,
      tokenHash,
      expiresAt: getTokenExpiry(refreshToken)
    });

    return { employee, accessToken, refreshToken };
  },
  refresh: async (refreshToken: string) => {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        sub: string;
        role: Role;
        jti: string;
      };
      const storedToken = await authRepository.findActiveRefreshToken(payload.jti);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError("Refresh token expired", 401);
      }
      const matches = await bcrypt.compare(refreshToken, storedToken.tokenHash);
      if (!matches) {
        throw new AppError("Refresh token invalid", 401);
      }

      const employee = await authRepository.findEmployeeById(payload.sub);
      if (!employee || !employee.isActive) {
        throw new AppError("Account is inactive", 403);
      }

      await authRepository.revokeRefreshToken(storedToken.id);

      const newRefreshId = crypto.randomUUID();
      const newRefreshToken = createRefreshToken({
        sub: employee.id,
        role: employee.role,
        jti: newRefreshId
      });
      const newHash = await bcrypt.hash(newRefreshToken, 12);
      await authRepository.createRefreshToken({
        id: newRefreshId,
        employeeId: employee.id,
        tokenHash: newHash,
        expiresAt: getTokenExpiry(newRefreshToken)
      });

      const accessToken = createAccessToken({ sub: employee.id, role: employee.role });
      return { accessToken, refreshToken: newRefreshToken, employee };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("Invalid refresh token", 401);
    }
  },
  logout: async (refreshToken?: string) => {
    if (!refreshToken) {
      return;
    }
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { jti: string };
      const stored = await authRepository.findRefreshTokenById(payload.jti);
      if (stored && !stored.revokedAt) {
        await authRepository.revokeRefreshToken(stored.id);
      }
    } catch {
      return;
    }
  },
  me: async (employeeId: string) => {
    const employee = await authRepository.findEmployeeById(employeeId);
    if (!employee || !employee.isActive) {
      throw new AppError("Unauthorized", 401);
    }
    return employee;
  }
};
