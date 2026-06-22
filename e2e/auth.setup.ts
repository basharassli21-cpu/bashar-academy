import { test as setup, expect } from "@playwright/test";
import {
  E2E_ADMIN_USERNAME,
  E2E_ADMIN_PASSWORD,
  E2E_SALES_USERNAME,
  E2E_SALES_PASSWORD,
  ADMIN_STORAGE_STATE,
  SALES_STORAGE_STATE,
} from "./test-users";

setup("authenticate as admin", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "locale", value: "en", url: baseURL! }]);
  await page.goto("/login");
  await page.locator("#username").fill(E2E_ADMIN_USERNAME);
  await page.locator("#password").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});

setup("authenticate as sales employee", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "locale", value: "en", url: baseURL! }]);
  await page.goto("/login");
  await page.locator("#username").fill(E2E_SALES_USERNAME);
  await page.locator("#password").fill(E2E_SALES_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/sales$/);
  await page.context().storageState({ path: SALES_STORAGE_STATE });
});
