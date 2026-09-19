import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeletePizzaDialog } from "./DeletePizzaDialog";

describe("DeletePizzaDialog", () => {
  it("uses a unique accessible title id for every dialog instance", () => {
    render(
      <>
        <DeletePizzaDialog
          open={false}
          pizzaName="First"
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
        <DeletePizzaDialog
          open={false}
          pizzaName="Second"
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
    );

    const dialogs = screen.getAllByRole("dialog", { hidden: true });
    const firstLabelId = dialogs[0]?.getAttribute("aria-labelledby");
    const secondLabelId = dialogs[1]?.getAttribute("aria-labelledby");

    expect(firstLabelId).toBeTruthy();
    expect(secondLabelId).toBeTruthy();
    expect(firstLabelId).not.toBe(secondLabelId);
    expect(document.getElementById(firstLabelId ?? "")).toHaveTextContent(
      "Delete First?",
    );
    expect(document.getElementById(secondLabelId ?? "")).toHaveTextContent(
      "Delete Second?",
    );
  });
});
