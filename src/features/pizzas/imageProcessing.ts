import { MAX_UPLOADED_IMAGE_DATA_URL_LENGTH, type PizzaImage } from "./pizza";

export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 1200;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const OUTPUT_QUALITIES = [0.82, 0.72, 0.62, 0.52] as const;
const OUTPUT_DIMENSIONS = [1200, 960, 720, 600] as const;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    return "Choose an image smaller than 8 MB.";
  }

  return null;
}

export function calculateContainedSize(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0 || maxDimension <= 0) {
    throw new Error("Image dimensions must be positive.");
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read this image."));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = () => reject(new Error("Could not decode this image."));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

export async function processPizzaImage(file: File): Promise<PizzaImage> {
  const validationError = validateImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);

  for (const maxDimension of OUTPUT_DIMENSIONS) {
    const size = calculateContainedSize(
      image.naturalWidth,
      image.naturalHeight,
      Math.min(maxDimension, MAX_IMAGE_DIMENSION),
    );
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image processing is unavailable in this browser.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(image, 0, 0, size.width, size.height);

    for (const quality of OUTPUT_QUALITIES) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);

      if (dataUrl.length <= MAX_UPLOADED_IMAGE_DATA_URL_LENGTH) {
        return { kind: "uploaded", dataUrl };
      }
    }
  }

  throw new Error(
    "This image remains too large after optimization. Try a smaller photo.",
  );
}
