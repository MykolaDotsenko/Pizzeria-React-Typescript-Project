import { expect, test } from "@playwright/test";

test("core create, navigate, and search flow works", async ({ page }) => {
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

  await card.getByRole("link", { name: "Nordic Heat", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Nordic Heat" })).toBeVisible();

  await page.getByRole("link", { name: /Back to menu/ }).click();
  await page.getByPlaceholder("Search pizzas").fill("Nordic Heat");
  await expect(
    page.getByRole("article").filter({ hasText: "Nordic Heat" }),
  ).toBeVisible();
});

test("edit, persistence, delete confirmation, and reload work", async ({ page }) => {
  await page.goto("/");

  let pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await pepperoniCard.getByRole("button", { name: "Edit Pepperoni" }).click();
  await pepperoniCard.getByLabel("Price (€)").fill("15.50");
  await pepperoniCard.getByRole("button", { name: "Save changes" }).click();
  await expect(pepperoniCard).toContainText(/15[.,]50/);

  await page.reload();
  pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await expect(pepperoniCard).toContainText(/15[.,]50/);

  await pepperoniCard.getByRole("button", { name: "Delete Pepperoni" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete Pepperoni?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Keep pizza" }).click();
  await expect(pepperoniCard).toBeVisible();

  await pepperoniCard.getByRole("button", { name: "Delete Pepperoni" }).click();
  await page
    .getByRole("dialog", { name: "Delete Pepperoni?" })
    .getByRole("button", { name: "Delete pizza" })
    .click();
  await expect(pepperoniCard).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("article").filter({ hasText: "Pepperoni" })).toHaveCount(
    0,
  );
});

test("validation and not-found routes fail safely", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Pizza name").fill("X");
  await page.getByLabel("Price (€)").fill("0.001");
  await page.getByRole("button", { name: "Add to menu" }).click();

  await expect(page.getByRole("alert")).toHaveCount(2);
  await expect(page.getByLabel("Pizza name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Price (€)")).toHaveAttribute("aria-invalid", "true");

  await page.goto("/pizza/missing-id");
  await expect(
    page.getByRole("heading", { name: "This pizza is no longer on the menu." }),
  ).toBeVisible();

  await page.goto("/totally-unknown-route");
  await expect(
    page.getByRole("heading", { name: "That page is not on the menu." }),
  ).toBeVisible();
});

test("unknown future storage stays intact and switches the app to read-only fallback", async ({
  page,
}) => {
  const futureData = JSON.stringify({
    version: 99,
    pizzas: [
      { id: "future", name: "Future Pizza", priceCents: 500, image: "pizza-1.jpg" },
    ],
    futureField: "preserve-me",
  });

  await page.addInitScript((raw) => {
    window.localStorage.setItem("pizzasState", raw);
  }, futureData);

  await page.goto("/");

  await expect(page.getByRole("status")).toContainText("Changes are temporary");

  await page.getByLabel("Pizza name").fill("Temporary Pizza");
  await page.getByLabel("Price (€)").fill("10.00");
  await page.getByRole("button", { name: "Add to menu" }).click();

  const stored = await page.evaluate(() => window.localStorage.getItem("pizzasState"));
  expect(stored).toBe(futureData);
});
