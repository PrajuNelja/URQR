# URQR POS API contract

All business endpoints require `Authorization: Bearer <access-token>`. Tenant identity comes from the verified JWT. The live generated OpenAPI document is `GET /v3/api-docs`; Swagger UI is `GET /swagger-ui.html`.

New hotel Manager and staff login usernames must be email addresses. Email usernames are matched without regard to case and are unique across every hotel. `POST /api/v1/platform/hotels` and `POST /api/v1/platform/hotels/{hotelId}/users` return `409 Conflict` if that email is already assigned.

## Catalog

`GET /api/v1/catalog/products` returns a paged list. Filters use the authenticated tenant and support `categoryId` and `available` (`true` by default; pass `false` to list out-of-stock products). Page size is capped at 100. Supported sorting fields are `name`, `price`, and `id`.

```http
GET /api/v1/catalog/products?page=0&size=20&available=true&sort=name,asc
```

`GET /api/v1/catalog/categories` returns a paged list. `activeOnly=true` is the default; pass `false` to include inactive categories. Supported sorting fields are `name`, `active`, and `id`.

```http
GET /api/v1/catalog/categories?page=0&size=20&activeOnly=true&sort=name,asc
```

The response uses Spring's page shape (`content`, `totalElements`, `totalPages`, `number`, `size`, and related paging fields). Product responses include `id`, `categoryId`, `name`, `price`, `available`, discount percent, and tax rates.

## Create an order

`POST /api/v1/orders` accepts one to 100 menu item lines and an optional list of payments. Use menu item IDs returned by the menu/catalog API. The example uses the local seed's Masala Chai; its demo price is ₹80.00 plus 9% CGST and 9% SGST, for a total of ₹94.40. Demo tax values are not production tax advice.

```json
{
  "items": [
    { "menuItemId": "<existing-menu-item-uuid>", "quantity": 1 }
  ],
  "payments": [
    { "method": "CASH", "amount": 94.40, "reference": null }
  ]
}
```

Use an existing menu item UUID and make the payment amount equal to the computed order total. Without a payment, the order remains open and unpaid. A full payment completes the order and stores its receipt snapshot in the same database transaction.

The response includes the order UUID/number, status, payment status, subtotal, discount, tax and grand totals, an `eventId` for the outbox record, and item snapshots. The generated OpenAPI document is authoritative if a field changes.

## Search and reprint

```http
GET /api/v1/orders?status=OPEN&from=2026-11-01T00:00:00Z&to=2026-12-01T00:00:00Z&page=0&size=20&sort=createdAt,desc
GET /api/v1/orders/<order-uuid>/receipt
```

The date range is inclusive at `from` and exclusive at `to`. Results are scoped to the authenticated hotel. A cashier from another hotel receives no order or receipt data.

## Local checks

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health/liveness
Invoke-RestMethod http://localhost:8080/actuator/health/readiness
Invoke-WebRequest http://localhost:8080/v3/api-docs | Select-Object -ExpandProperty Content
```

Expected: liveness and readiness return `{"status":"UP"}`; OpenAPI JSON contains `"openapi":"3.1.0"` and the catalog/order paths. Use Swagger UI to obtain a token and exercise the protected requests.
