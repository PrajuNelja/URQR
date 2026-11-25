import { http, HttpResponse } from "msw";

export const mockCatalogDishes = [
  { id: 1, name: "Truffle Mushroom Soup", category: "Starters", description: "Served with garlic bread", price: 12 },
  { id: 2, name: "Classic Caesar Salad", category: "Starters", description: "Romaine, parmesan, croutons", price: 14 },
  { id: 3, name: "Grilled Salmon Steak", category: "Main Course", description: "Fresh herbs & lemon butter", price: 24.5 },
  { id: 4, name: "Wagyu Ribeye", category: "Main Course", description: "Cheddar, brioche, fries", price: 48 },
  { id: 5, name: "Lobster Linguine", category: "Main Course", description: "Chili, garlic, white wine", price: 36 },
  { id: 6, name: "Ribeye Beef Burger", category: "Main Course", description: "With cheddar & fries", price: 18.5 },
  { id: 7, name: "Belgian Chocolate Lava Cake", category: "Desserts", description: "Vanilla bean ice cream", price: 11 },
  { id: 8, name: "Artisanal Espresso", category: "Beverages", description: "Single-origin, double shot", price: 5 },
  { id: 9, name: "Fresh Lime Soda", category: "Beverages", description: "Sweet or salted", price: 6 },
];

export const handlers = [
  http.get("/api/products", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Laptop",
        price: 75000,
      },
      {
        id: "2",
        name: "Keyboard",
        price: 2500,
      },
    ]);
  }),

  http.get("*/products", () => {
    return HttpResponse.json(mockCatalogDishes);
  }),

  http.get("*/catalog", () => {
    return HttpResponse.json(mockCatalogDishes);
  }),
];

