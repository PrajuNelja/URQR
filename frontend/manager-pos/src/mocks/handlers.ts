import { http, HttpResponse } from "msw";

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
];
