import { test, expect } from "@playwright/test";
import { E2E_ADMIN_USERNAME, ADMIN_STORAGE_STATE } from "./test-users";

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("visiting an admin route redirects to /login", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: "locale", value: "en", url: baseURL! }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("wrong password is rejected and stays on /login", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: "locale", value: "en", url: baseURL! }]);
    await page.goto("/login");
    await page.locator("#username").fill(E2E_ADMIN_USERNAME);
    await page.locator("#password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("authenticated admin", () => {
  test.use({ storageState: ADMIN_STORAGE_STATE });

  test("logout clears the session", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });
});
