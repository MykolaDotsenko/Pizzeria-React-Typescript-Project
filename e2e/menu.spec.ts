import { expect, test, type Page } from "@playwright/test";

async function addNordicHeat(page: Page) {
  await page.getByLabel("Pizza name").fill("Nordic Heat");
  await page
    .getByLabel("Description")
    .fill("Smoky pepperoni, mozzarella, chili, and roasted tomato.");
  await page.getByLabel("Category", { exact: true }).selectOption("spicy");
  await page.getByLabel("Price (€)").fill("14.90");
  await page.getByRole("button", { name: "Add to menu" }).click();
}

test("customer-facing create, category, search, and details flow works", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Craft a menu that feels ready to serve." }),
  ).toBeVisible();

  await addNordicHeat(page);

  const card = page.getByRole("article").filter({ hasText: "Nordic Heat" });
  await expect(card).toContainText("Spicy");
  await expect(card).toContainText("Smoky pepperoni");
  await expect(card).toContainText(/14[.,]90/);

  await card.getByRole("link", { name: "Nordic Heat", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Nordic Heat" })).toBeVisible();
  await expect(page.getByText("Spicy")).toBeVisible();
  await expect(page.getByText(/Smoky pepperoni/)).toBeVisible();

  await page.getByRole("link", { name: /Back to menu/ }).click();
  await page.getByPlaceholder("Search pizzas").fill("roasted tomato");
  await expect(
    page.getByRole("article").filter({ hasText: "Nordic Heat" }),
  ).toBeVisible();
});

test("operator can edit, filter, reorder, undo delete, and persist changes", async ({
  page,
}) => {
  await page.goto("/");

  let pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await pepperoniCard.getByRole("button", { name: "Edit Pepperoni" }).click();
  await pepperoniCard.getByLabel("Price (€)").fill("15.50");
  await pepperoniCard
    .getByLabel("Description")
    .fill("Pepperoni, mozzarella, tomato, oregano, and chili oil.");
  await pepperoniCard.getByRole("button", { name: "Save changes" }).click();
  await expect(pepperoniCard).toContainText(/15[.,]50/);

  await page.reload();
  pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await expect(pepperoniCard).toContainText(/15[.,]50/);
  await expect(pepperoniCard).toContainText("chili oil");

  await page.getByLabel("Filter by category").selectOption("vegetarian");
  await expect(
    page.getByRole("article").filter({ hasText: "Margherita" }),
  ).toBeVisible();
  await expect(pepperoniCard).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();

  const mixedCard = page.getByRole("article").filter({ hasText: "Mixed" });
  await mixedCard.getByRole("button", { name: "Move Mixed up" }).click();
  const visibleNames = await page.locator(".pizza-card h3").allTextContents();
  expect(visibleNames.at(-1)).not.toBe("Mixed");

  pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await pepperoniCard.getByRole("button", { name: "Delete Pepperoni" }).click();
  await expect(pepperoniCard).toHaveCount(0);
  await expect(page.getByText("Pepperoni removed.")).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  pepperoniCard = page.getByRole("article").filter({ hasText: "Pepperoni" });
  await expect(pepperoniCard).toBeVisible();

  await pepperoniCard.getByRole("button", { name: "Delete Pepperoni" }).click();
  await page.getByRole("button", { name: "Dismiss undo message" }).click();
  await page.reload();
  await expect(page.getByRole("article").filter({ hasText: "Pepperoni" })).toHaveCount(
    0,
  );
});

test("validation and image upload guards are clear", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Pizza name").fill("X");
  await page.getByLabel("Description").fill("Short");
  await page.getByLabel("Price (€)").fill("0.001");
  await page.getByRole("button", { name: "Add to menu" }).click();

  await expect(page.getByRole("alert")).toHaveCount(3);

  await page.getByLabel("Upload own photo").setInputFiles({
    name: "pizza.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("gif-data"),
  });
  await expect(page.getByRole("alert").last()).toContainText(
    "Use a JPG, PNG, or WebP image.",
  );
});

test("a valid custom image is optimized, persisted, and displayed", async ({
  page,
}) => {
  await page.goto("/");

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZfS8AAAAASUVORK5CYII=",
    "base64",
  );

  await page.getByLabel("Pizza name").fill("Photo Pizza");
  await page
    .getByLabel("Description")
    .fill("A custom-photo pizza prepared for image upload testing.");
  await page.getByLabel("Price (€)").fill("11.50");
  await page.getByLabel("Upload own photo").setInputFiles({
    name: "pizza.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });

  await expect(page.getByText("Optimizing photo…")).toHaveCount(0);
  await page.getByRole("button", { name: "Add to menu" }).click();

  let card = page.getByRole("article").filter({ hasText: "Photo Pizza" });
  await expect(card.locator("img")).toHaveAttribute("src", /^data:image\/jpeg;base64,/);

  await page.reload();
  card = page.getByRole("article").filter({ hasText: "Photo Pizza" });
  await expect(card.locator("img")).toHaveAttribute("src", /^data:image\/jpeg;base64,/);
});

test("not-found and unknown future storage scenarios fail safely", async ({ page }) => {
  await page.goto("/pizza/missing-id");
  await expect(
    page.getByRole("heading", { name: "This pizza is no longer on the menu." }),
  ).toBeVisible();

  const futureData = JSON.stringify({
    version: 99,
    pizzas: [{ id: "future", name: "Future Pizza" }],
    futureField: "preserve-me",
  });

  await page.addInitScript((raw) => {
    window.localStorage.setItem("pizzasState", raw);
  }, futureData);

  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Changes are temporary");

  await page.getByLabel("Pizza name").fill("Temporary Pizza");
  await page
    .getByLabel("Description")
    .fill("A temporary pizza that must not overwrite future data.");
  await page.getByLabel("Price (€)").fill("10.00");
  await page.getByRole("button", { name: "Add to menu" }).click();

  const stored = await page.evaluate(() => window.localStorage.getItem("pizzasState"));
  expect(stored).toBe(futureData);
});

test("desktop drag-and-drop reorders menu items", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "Desktop drag behavior");

  await page.goto("/");

  const pepperoni = page.getByRole("article").filter({ hasText: "Pepperoni" });
  const margherita = page.getByRole("article").filter({ hasText: "Margherita" });

  await pepperoni.dragTo(margherita);

  const names = await page.locator(".pizza-card h3").allTextContents();
  expect(names[0]).toBe("Margherita");
  expect(names[1]).toBe("Pepperoni");

  await page.reload();
  const persistedNames = await page.locator(".pizza-card h3").allTextContents();
  expect(persistedNames[0]).toBe("Margherita");
  expect(persistedNames[1]).toBe("Pepperoni");
});
