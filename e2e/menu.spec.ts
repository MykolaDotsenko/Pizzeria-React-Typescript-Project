import { expect, test } from "@playwright/test";

test("core menu flow works end to end", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Craft a menu that feels ready to serve." }),
  ).toBeVisible();

  await page.getByLabel("Pizza name").fill("Nordic Heat");
  await page.getByLabel("Price (€)").fill("14.90");
  await page.getByRole("button", { name: "Add to menu" }).click();

  const card = page.getByRole("article").filter({ hasText: "Nordic Heat" });
  await expect(card).toBeVisible();
  await expect(card).toContainText(/14[.,]90/);

  await card.getByRole("link", { name: "Nordic Heat" }).click();
  await expect(page.getByRole("heading", { name: "Nordic Heat" })).toBeVisible();

  await page.getByRole("link", { name: /Back to menu/ }).click();
  await page.getByPlaceholder("Search pizzas").fill("Nordic Heat");
  await expect(
    page.getByRole("article").filter({ hasText: "Nordic Heat" }),
  ).toBeVisible();
});

test("deep links resolve through the SPA", async ({ page }) => {
  await page.goto("/pizza/1");
  await expect(page.getByRole("heading", { name: "Pepperoni" })).toBeVisible();
});
