# URQR Hotel POS Entities and Relationships

This document describes the active hotel-owned JPA model after Flyway migration V11. The old tenant tables and their JPA mappings were removed. Hotel-owned rows use `hotel_id`; the transactional outbox is JDBC-managed and also uses `hotel_id`.

## Entities

### `Hotel` — table `hotel`

- `id: UUID`
- `name: String`
- `currencyCode: String`
- `timezone: String`
- `dayCutoff: LocalTime`
- `status: String`
- `receiptDetails: Map<String, Object>` — JSONB
- `createdAt: Instant`

### `Role` — table `hotel_role`

- `id: UUID`
- `hotelId: UUID`
- `hotel: Hotel` — association through `hotel_id`
- `name: String`

### `StaffUser` — table `staff_user`

- `id: UUID`
- `hotelId: UUID`
- `username: String`
- `passwordHash: String`
- `roleId: UUID`
- `roleEntity: Role` — association through `(hotel_id, role_id)`
- `status: String`
- `createdAt: Instant`

### `AuditRecord` — table `audit_record`

- `id: UUID`
- `hotelId: UUID`
- `hotel: Hotel` — association through `hotel_id`
- `userId: UUID` — nullable
- `user: StaffUser` — association through `(hotel_id, user_id)`
- `action: String`
- `entity: String`
- `entityId: String` — nullable
- `oldValue: String` — nullable
- `newValue: String` — nullable
- `createdAt: Instant`

### `MenuCategory` — table `menu_category`

- `id: UUID`
- `hotelId: UUID`
- `hotel: Hotel` — association through `hotel_id`
- `name: String`
- `active: boolean`

### `MenuItem` — table `menu_item`

- `id: UUID`
- `hotelId: UUID`
- `categoryId: UUID`
- `category: MenuCategory` — association through `(hotel_id, category_id)`
- `name: String`
- `price: BigDecimal`
- `available: boolean`
- `active: boolean`
- `cgstRate`, `sgstRate`, `vatRate`, `discountPercent: BigDecimal`

### `Order` — table `pos_order`

- `id: UUID`
- `hotelId: UUID`
- `hotel: Hotel` — association through `hotel_id`
- `orderNumber: String`
- `creator: StaffUser` — association through `(hotel_id, created_by)`
- `status: OrderStatus`
- `paymentStatus: PaymentStatus`
- `subtotal`, `discountTotal`, `taxTotal`, `grandTotal: BigDecimal`
- `createdBy: UUID`
- `cancelReason: String` — nullable
- `createdAt`, `updatedAt: Instant`

### `OrderItem` — table `order_item`

- `id: UUID`
- `hotelId: UUID`
- `orderId: UUID`; `order: Order` — association through `(hotel_id, order_id)`
- `menuItemId: UUID`; `menuItem: MenuItem` — association through `(hotel_id, menu_item_id)`
- `nameSnapshot: String`
- `priceSnapshot`, `discountAmount`, `taxCgst`, `taxSgst`, `taxVat`, `lineTotal: BigDecimal`
- `quantity: int`

### `Payment` — table `payment`

- `id: UUID`
- `hotelId: UUID`
- `orderId: UUID`
- `order: Order` — association through `(hotel_id, order_id)`
- `method: PaymentMethod`
- `amount: BigDecimal`
- `referenceNo: String` — nullable
- `createdAt: Instant`

### `Receipt` — table `receipt`

- `id: UUID`
- `hotelId: UUID`
- `orderId: UUID`
- `order: Order` — association through `(hotel_id, order_id)`
- `receiptNumber: String`
- `snapshot: Map<String, Object>` — JSONB
- `createdAt: Instant`

## Relationships

```mermaid
erDiagram
    HOTEL ||--o{ HOTEL_ROLE : hotel_id
    HOTEL ||--o{ STAFF_USER : hotel_id
    HOTEL_ROLE ||--o{ STAFF_USER : role_id_and_hotel_id
    HOTEL ||--o{ AUDIT_RECORD : hotel_id
    STAFF_USER o|--o{ AUDIT_RECORD : user_id_and_hotel_id
    HOTEL ||--o{ MENU_CATEGORY : hotel_id
    HOTEL ||--o{ MENU_ITEM : hotel_id
    MENU_CATEGORY ||--o{ MENU_ITEM : category_id_and_hotel_id
    HOTEL ||--o{ POS_ORDER : hotel_id
    STAFF_USER ||--o{ POS_ORDER : created_by_and_hotel_id
    POS_ORDER ||--o{ ORDER_ITEM : order_id_and_hotel_id
    MENU_ITEM ||--o{ ORDER_ITEM : menu_item_id_and_hotel_id
    POS_ORDER ||--o{ PAYMENT : order_id_and_hotel_id
    POS_ORDER ||--o| RECEIPT : order_id
    HOTEL ||--o{ OUTBOX_EVENTS : hotel_id
```

The outbox has no JPA entity. It is written in the same transaction as POS order changes and published asynchronously. Row-level security uses the transaction-local `app.hotel_id` setting, populated from the authenticated `hotel_id` claim.
