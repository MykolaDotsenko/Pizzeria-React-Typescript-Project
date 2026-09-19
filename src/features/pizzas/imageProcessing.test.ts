import { describe, expect, it } from "vitest";
import {
  MAX_SOURCE_IMAGE_BYTES,
  calculateContainedSize,
  validateImageFile,
} from "./imageProcessing";

describe("imageProcessing", () => {
  it("contains a landscape image without enlarging it", () => {
    expect(calculateContainedSize(1600, 800, 1200)).toEqual({
      width: 1200,
      height: 600,
    });
    expect(calculateContainedSize(600, 400, 1200)).toEqual({
      width: 600,
      height: 400,
    });
  });

  it("rejects unsupported image formats", () => {
    const file = new File(["data"], "pizza.gif", { type: "image/gif" });
    expect(validateImageFile(file)).toBe("Use a JPG, PNG, or WebP image.");
  });

  it("rejects source images over the upload limit", () => {
    const file = new File([new Uint8Array(MAX_SOURCE_IMAGE_BYTES + 1)], "pizza.jpg", {
      type: "image/jpeg",
    });
    expect(validateImageFile(file)).toBe("Choose an image smaller than 8 MB.");
  });
});
