import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PizzaImage } from "./pizza";
import { PizzaForm } from "./PizzaForm";

const processPizzaImageMock = vi.hoisted(() => vi.fn());

vi.mock("./imageProcessing", () => ({
  processPizzaImage: processPizzaImageMock,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

describe("PizzaForm image concurrency", () => {
  beforeEach(() => {
    processPizzaImageMock.mockReset();
  });

  it("keeps the latest upload authoritative when an older request resolves last", async () => {
    const user = userEvent.setup();
    const first = deferred<PizzaImage>();
    const second = deferred<PizzaImage>();
    const firstImage: PizzaImage = {
      kind: "uploaded",
      dataUrl: "data:image/jpeg;base64,RklSU1Q=",
    };
    const secondImage: PizzaImage = {
      kind: "uploaded",
      dataUrl: "data:image/jpeg;base64,U0VDT05E",
    };

    processPizzaImageMock
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    render(<PizzaForm submitLabel="Add to menu" onSubmit={vi.fn()} />);

    const upload = screen.getByLabelText("Upload own photo");

    await user.upload(
      upload,
      new File(["first"], "first.jpg", { type: "image/jpeg" }),
    );
    await user.upload(
      upload,
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    );

    expect(processPizzaImageMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      first.resolve(firstImage);
      await first.promise;
    });

    expect(screen.getByAltText("Pizza photo preview")).not.toHaveAttribute(
      "src",
      firstImage.dataUrl,
    );
    expect(
      screen.getByRole("button", { name: "Preparing photo…" }),
    ).toBeDisabled();

    await act(async () => {
      second.resolve(secondImage);
      await second.promise;
    });

    await waitFor(() => {
      expect(screen.getByAltText("Pizza photo preview")).toHaveAttribute(
        "src",
        secondImage.dataUrl,
      );
    });
    expect(screen.getByRole("button", { name: "Add to menu" })).toBeEnabled();
  });

  it("does not let a pending upload overwrite a newly selected preset", async () => {
    const user = userEvent.setup();
    const pending = deferred<PizzaImage>();
    const uploadedImage: PizzaImage = {
      kind: "uploaded",
      dataUrl: "data:image/jpeg;base64,U1RBTEU=",
    };

    processPizzaImageMock.mockReturnValueOnce(pending.promise);

    render(<PizzaForm submitLabel="Add to menu" onSubmit={vi.fn()} />);

    await user.upload(
      screen.getByLabelText("Upload own photo"),
      new File(["photo"], "photo.jpg", { type: "image/jpeg" }),
    );
    await user.selectOptions(screen.getByLabelText("Preset photo"), "pizza-2.jpg");

    await act(async () => {
      pending.resolve(uploadedImage);
      await pending.promise;
    });

    await waitFor(() => {
      expect(screen.getByAltText("Pizza photo preview")).toHaveAttribute(
        "src",
        expect.stringMatching(/images\/pizza-2\.jpg$/),
      );
    });
    expect(screen.getByRole("button", { name: "Add to menu" })).toBeEnabled();
  });
});
