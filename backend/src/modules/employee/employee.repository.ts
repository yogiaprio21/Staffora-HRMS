import { prisma } from "../../config/prisma";
import { Prisma, Role } from "@prisma/client";

export type EmployeeSortBy =
  | "name"
  | "email"
  | "department"
  | "role"
  | "status"
  | "leaveBalance"
  | "createdAt";

const employeeOrderBy = (
  sortBy: EmployeeSortBy = "createdAt",
  sortOrder: Prisma.SortOrder = "desc"
): Prisma.EmployeeOrderByWithRelationInput[] => {
  if (sortBy === "name") {
    return [{ firstName: sortOrder }, { lastName: sortOrder }];
  }
  if (sortBy === "status") {
    return [{ isActive: sortOrder }, { createdAt: "desc" }];
  }
  if (sortBy === "leaveBalance") {
    return [{ leaveBalance: sortOrder }, { createdAt: "desc" }];
  }
  return [{ [sortBy]: sortOrder } as Prisma.EmployeeOrderByWithRelationInput];
};

export const employeeRepository = {
  create: async (data: {
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
  update: async (
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      role: Role;
      department: string;
      position?: string;
      leaveBalance: number;
      isActive: boolean;
    }>
  ) => {
    return prisma.employee.update({ where: { id }, data });
  },
  findByEmail: async (email: string) => {
    return prisma.employee.findFirst({ where: { email, deletedAt: null } });
  },
  findById: async (id: string) => {
    return prisma.employee.findFirst({ where: { id, deletedAt: null } });
  },
  findAnyById: async (id: string) => {
    return prisma.employee.findUnique({ where: { id } });
  },
  softDelete: async (id: string) => {
    return prisma.employee.update({
      where: { id },
      data: { isActive: false }
    });
  },
  restore: async (id: string) => {
    return prisma.employee.update({
      where: { id },
      data: { deletedAt: null, isActive: true }
    });
  },
  departments: async () => {
    const rows = await prisma.employee.findMany({
      where: { deletedAt: null },
      distinct: ["department"],
      select: { department: true },
      orderBy: { department: "asc" }
    });
    return rows.map((row) => row.department);
  },
  summary: async () => {
    const [active, inactive, archived, departments] = await Promise.all([
      prisma.employee.count({ where: { deletedAt: null, isActive: true } }),
      prisma.employee.count({ where: { deletedAt: null, isActive: false } }),
      prisma.employee.count({ where: { deletedAt: { not: null } } }),
      prisma.employee.groupBy({
        by: ["department"],
        where: { deletedAt: null },
        _count: { _all: true },
        orderBy: { department: "asc" }
      })
    ]);
    return {
      active,
      inactive,
      archived,
      departments: departments.map((department) => ({
        department: department.department,
        total: department._count._all
      }))
    };
  },
  list: async (params: {
    skip: number;
    take: number;
    search?: string;
    department?: string;
    role?: Role;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
    sortBy?: EmployeeSortBy;
    sortOrder?: Prisma.SortOrder;
  }) => {
    const where = {
      deletedAt: null,
      ...(params.status === "ACTIVE" ? { isActive: true } : {}),
      ...(params.status === "INACTIVE" ? { isActive: false } : {}),
      ...(params.department ? { department: params.department } : {}),
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              {
                firstName: {
                  contains: params.search,
                  mode: Prisma.QueryMode.insensitive
                }
              },
              {
                lastName: {
                  contains: params.search,
                  mode: Prisma.QueryMode.insensitive
                }
              }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: employeeOrderBy(params.sortBy, params.sortOrder)
      }),
      prisma.employee.count({ where })
    ]);
    return { items, total };
  }
};
