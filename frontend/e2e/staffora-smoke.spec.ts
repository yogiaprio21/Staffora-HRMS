import { test, expect } from "@playwright/test";

const e2eEnabled = process.env.E2E_ENABLED === "true";
const hrEmail = process.env.E2E_HR_EMAIL || "hr@staffora.local";
const employeeEmail = process.env.E2E_EMPLOYEE_EMAIL || "emma@staffora.local";
const password = process.env.E2E_PASSWORD || "Password123!";

test.describe("Staffora deploy smoke", () => {
  test.skip(!e2eEnabled, "Set E2E_ENABLED=true with a running backend/frontend to run deploy smoke tests.");

  test("HR can sign in and reach the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(hrEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Pending Leaves")).toBeVisible();
  });

  test("Employee can sign in and reach profile leave history", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(employeeEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("My Leave History")).toBeVisible();
  });
});
