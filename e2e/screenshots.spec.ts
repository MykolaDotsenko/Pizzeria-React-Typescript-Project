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

  // Trigger lazy-loaded local pizza images once, then restore the canonical
  // top-of-page composition before capturing the portfolio viewport.
  await page.getByRole("article").last().scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(
    page.getByRole("heading", { name: "Craft a menu that feels ready to serve." }),
  ).toBeVisible();

  await page.screenshot({
    path:
      project === "mobile-chromium"
        ? `${screenshotsDir}/pizzeria-mobile.png`
        : `${screenshotsDir}/pizzeria-desktop.png`,
    fullPage: false,
    animations: "disabled",
  });
});
