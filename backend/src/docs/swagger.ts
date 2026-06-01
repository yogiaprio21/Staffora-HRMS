import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Staffora HRMS – Intelligent Workforce Management System",
    version: "1.0.0"
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Auth" },
    { name: "Employee" },
    { name: "Leave" },
    { name: "Dashboard" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation error" },
          details: { type: "object" }
        }
      },
      Employee: {
        type: "object",
        properties: {
          id: { type: "string", example: "uuid" },
          firstName: { type: "string", example: "Amina" },
          lastName: { type: "string", example: "Patel" },
          email: { type: "string", example: "amina@company.com" },
          role: { type: "string", example: "EMPLOYEE" },
          department: { type: "string", example: "Engineering" },
          leaveBalance: { type: "number", example: 18 },
          isActive: { type: "boolean", example: true }
        }
      },
      LeaveRequest: {
        type: "object",
        properties: {
          id: { type: "string", example: "uuid" },
          employeeId: { type: "string", example: "uuid" },
          startDate: { type: "string", example: "2026-03-01T00:00:00.000Z" },
          endDate: { type: "string", example: "2026-03-03T00:00:00.000Z" },
          reason: { type: "string", example: "Annual leave" },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "CANCELED"], example: "PENDING" }
        }
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Register employee",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string", example: "Amina" },
                  lastName: { type: "string", example: "Patel" },
                  email: { type: "string", example: "amina@company.com" },
                  password: { type: "string", example: "StrongPass123!" },
                  role: { type: "string", example: "EMPLOYEE" },
                  department: { type: "string", example: "Engineering" },
                  position: { type: "string", example: "Software Engineer" }
                },
                required: ["firstName", "lastName", "email", "password", "role", "department"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Employee registered",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } }
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "amina@company.com" },
                  password: { type: "string", example: "StrongPass123!" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    employee: { $ref: "#/components/schemas/Employee" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh token",
        responses: {
          "200": {
            description: "Tokens refreshed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        responses: { "200": { description: "Logged out" } }
      }
    },
    "/employees": {
      get: {
        tags: ["Employee"],
        security: [{ bearerAuth: [] }],
        summary: "List employees",
        parameters: [
          { in: "query", name: "page", schema: { type: "number", example: 1 } },
          { in: "query", name: "limit", schema: { type: "number", example: 20 } },
          { in: "query", name: "search", schema: { type: "string", example: "Amina" } },
          { in: "query", name: "department", schema: { type: "string", example: "Engineering" } },
          { in: "query", name: "role", schema: { type: "string", example: "EMPLOYEE" } }
        ],
        responses: {
          "200": {
            description: "Employees",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: { $ref: "#/components/schemas/Employee" } },
                    total: { type: "number", example: 120 }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Employee"],
        security: [{ bearerAuth: [] }],
        summary: "Create employee",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/paths/~1auth~1register/post/requestBody/content/application~1json/schema" } } }
        },
        responses: { "201": { description: "Employee created" } }
      }
    },
    "/employees/{id}": {
      put: {
        tags: ["Employee"],
        security: [{ bearerAuth: [] }],
        summary: "Update employee",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Employee updated" } }
      },
      delete: {
        tags: ["Employee"],
        security: [{ bearerAuth: [] }],
        summary: "Soft delete employee",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Employee deleted" } }
      }
    },
    "/leaves": {
      get: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Leave history",
        parameters: [
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "CANCELED"], example: "PENDING" }
          },
          { in: "query", name: "employeeId", schema: { type: "string" } }
        ],
        responses: { "200": { description: "Leave history" } }
      },
      post: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Submit leave request",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  startDate: { type: "string", example: "2026-03-01" },
                  endDate: { type: "string", example: "2026-03-03" },
                  reason: { type: "string", example: "Annual leave" }
                },
                required: ["startDate", "endDate", "reason"]
              }
            }
          }
        },
        responses: { "201": { description: "Leave request created" } }
      }
    },
    "/leaves/{id}/approve": {
      patch: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Approve leave request",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Leave approved" } }
      }
    },
    "/leaves/{id}/reject": {
      patch: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Reject leave request",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Leave rejected" } }
      }
    },
    "/leaves/{id}/cancel": {
      patch: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Cancel pending leave request",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Leave canceled" } }
      }
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Dashboard statistics",
        responses: { "200": { description: "Dashboard stats" } }
      }
    },
    "/reports/employees/pdf": {
      get: {
        tags: ["Employee"],
        security: [{ bearerAuth: [] }],
        summary: "Export employees PDF",
        responses: { "200": { description: "PDF stream" } }
      }
    },
    "/reports/leaves/excel": {
      get: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Export leave report Excel",
        responses: { "200": { description: "Excel stream" } }
      }
    }
  }
};

export const swaggerRouter = Router();

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(openApiSpec));
