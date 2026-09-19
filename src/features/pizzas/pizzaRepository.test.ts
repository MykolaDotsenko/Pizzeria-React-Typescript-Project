import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPresetPizzaImage, type Pizza } from "./pizza";
import { createLocalStoragePizzaRepository } from "./pizzaRepository";
import { seedPizzas } from "./seedPizzas";

const currentPizza: Pizza = {
  id: "new-id",
  name: "Test Pizza",
  description: "A complete test pizza description for persistence.",
  category: "special",
  priceCents: 1250,
  image: createPresetPizzaImage("pizza-1.jpg"),
};

describe("pizzaRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("uses seed data when storage is empty", () => {
    expect(createLocalStoragePizzaRepository(window.localStorage).load()).toEqual(
      seedPizzas,
    );
  });

  it("persists the current versioned model", () => {
    const repository = createLocalStoragePizzaRepository(window.localStorage);

    expect(repository.save([currentPizza])).toBe(true);
    expect(JSON.parse(window.localStorage.getItem("pizzasState") ?? "")).toEqual({
      version: 3,
      pizzas: [currentPizza],
    });
    expect(repository.load()).toEqual([currentPizza]);
  });

  it("migrates version 2 records to richer version 3 records", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify({
        version: 2,
        pizzas: [
          {
            id: "2",
            name: "Veggie",
            priceCents: 1200,
            image: "pizza-5.jpg",
          },
        ],
      }),
    );

    const repository = createLocalStoragePizzaRepository(window.localStorage);
    const [pizza] = repository.load();

    expect(pizza).toMatchObject({
      id: "2",
      name: "Veggie",
      category: "vegetarian",
      priceCents: 1200,
      image: { kind: "preset", value: "pizza-5.jpg" },
    });
    expect(pizza?.description.length).toBeGreaterThanOrEqual(10);
    const stored: unknown = JSON.parse(
      window.localStorage.getItem("pizzasState") ?? "",
    );
    expect(stored).toMatchObject({ version: 3 });
  });

  it("migrates version 1 money and ids to the current domain model", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify({
        version: 1,
        pizzas: [{ id: 7, title: "Legacy Pizza", price: "14.50", img: "pizza-2.jpg" }],
      }),
    );

    const repository = createLocalStoragePizzaRepository(window.localStorage);
    const [pizza] = repository.load();

    expect(pizza).toMatchObject({
      id: "7",
      name: "Legacy Pizza",
      priceCents: 1450,
      image: { kind: "preset", value: "pizza-2.jpg" },
    });
  });

  it("recovers from corrupted JSON", () => {
    window.localStorage.setItem("pizzasState", "{broken");
    const repository = createLocalStoragePizzaRepository(window.localStorage);

    expect(repository.load()).toEqual(seedPizzas);
    expect(window.localStorage.getItem("pizzasState")).toBeNull();
  });

  it("reports unavailable storage without throwing", () => {
    const repository = createLocalStoragePizzaRepository(null);

    expect(repository.load()).toEqual(seedPizzas);
    expect(repository.isWritable()).toBe(false);
    expect(repository.save(seedPizzas)).toBe(false);
  });

  it("reports write failures such as storage quota exhaustion", () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(() => null),
      length: 0,
    } satisfies Storage;
    const repository = createLocalStoragePizzaRepository(storage);

    expect(repository.save([currentPizza])).toBe(false);
    expect(repository.isWritable()).toBe(false);
  });

  it("preserves unknown-version data and blocks downgrade writes", () => {
    const futureData = JSON.stringify({
      version: 99,
      pizzas: [{ id: "future", name: "Future Pizza" }],
      futureField: "must-survive",
    });
    window.localStorage.setItem("pizzasState", futureData);

    const repository = createLocalStoragePizzaRepository(window.localStorage);

    expect(repository.load()).toEqual(seedPizzas);
    expect(repository.isWritable()).toBe(false);
    expect(repository.save(seedPizzas)).toBe(false);
    expect(window.localStorage.getItem("pizzasState")).toBe(futureData);
  });
});
