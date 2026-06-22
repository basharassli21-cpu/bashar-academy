export const E2E_ADMIN_USERNAME = "e2e-admin-smoke-test";
export const E2E_ADMIN_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "E2eSmokeTest!2026";

export const E2E_SALES_USERNAME = "e2e-sales-smoke-test";
export const E2E_SALES_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "E2eSmokeTest!2026";

export const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";
export const SALES_STORAGE_STATE = "e2e/.auth/sales.json";
