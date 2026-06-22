import { test, expect } from "@playwright/test";
import { ADMIN_STORAGE_STATE } from "./test-users";

test.use({ storageState: ADMIN_STORAGE_STATE });

test("create, update, and delete a lead end to end", async ({ page }) => {
  const customerName = `E2E Smoke Test Lead ${Date.now()}`;
  const phone = `0599${String(Date.now()).slice(-7)}`;

  await page.goto("/admin/leads");
  await page.getByRole("button", { name: "New Lead" }).click();
  await expect(page.getByRole("heading", { name: "Create Lead" })).toBeVisible();
  await page.locator("#leadCustomerName").fill(customerName);
  await page.locator("#leadPhone").fill(phone);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Lead created")).toBeVisible();

  const search = page.getByPlaceholder("Search by name or phone...");
  await search.fill(customerName);
  const leadLink = page.getByRole("link", { name: customerName });
  await expect(leadLink).toBeVisible();
  await leadLink.click();

  await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
  await expect(page.getByRole("heading", { name: customerName })).toBeVisible();

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Contacted" }).click();
  await page.locator("#callNote").fill("E2E smoke test call note");
  await page.getByRole("button", { name: "Save Update" }).click();
  await expect(page.getByText("Lead updated")).toBeVisible();
  await expect(page.getByText("E2E smoke test call note")).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("heading", { name: "Delete this lead?" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Lead deleted")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/leads$/);

  await page.getByPlaceholder("Search by name or phone...").fill(customerName);
  await expect(page.getByText("No results")).toBeVisible();
});
