import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PizzasProvider } from "../context/PizzasContext";
import PizzaFeature from "./PizzaFeature";

const renderRoute = (path: string) =>
  render(
    <PizzasProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pizza/:id" element={<PizzaFeature />} />
        </Routes>
      </MemoryRouter>
    </PizzasProvider>
  );

describe("PizzaFeature", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders a valid pizza id", () => {
    renderRoute("/pizza/1");

    expect(
      screen.getByRole("heading", { name: "Pepperoni" })
    ).toBeInTheDocument();
  });

  it("rejects non-canonical numeric-looking ids", () => {
    renderRoute("/pizza/1e0");

    expect(
      screen.getByRole("heading", { name: "Pizza not found" })
    ).toBeInTheDocument();
  });
});
