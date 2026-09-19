import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const screenshotsDir = "docs/screenshots";

test("capture deterministic portfolio screenshots", async ({ page }, testInfo) => {
  const project = testInfo.project.name;

  test.skip(
    project !== "chromium" && project !== "mobile-chromium",
    "Portfolio screenshots are captured only in the canonical Chromium projects.",
  );

  await mkdir(screenshotsDir, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Craft a menu that feels ready to serve." }),
  ).toBeVisible();

  await expect(page.getByRole("article")).toHaveCount(6);

  const imageCount = await page.locator(".pizza-card img").count();
  await Promise.all(
    Array.from({ length: imageCount }, (_, index) =>
      page
        .locator(".pizza-card img")
        .nth(index)
        .evaluate((image: HTMLImageElement) => {
          if (image.complete) {
            return;
          }

          return new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        }),
    ),
  );

  await page.screenshot({
    path:
      project === "mobile-chromium"
        ? `${screenshotsDir}/pizzeria-mobile.png`
        : `${screenshotsDir}/pizzeria-desktop.png`,
    fullPage: false,
    animations: "disabled",
  });
});
