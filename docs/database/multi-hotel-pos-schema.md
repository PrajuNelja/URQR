# Multi-hotel POS schema

The initial PostgreSQL schema is in [`infrastructure/database/V1__multi_hotel_pos_schema.sql`](../../infrastructure/database/V1__multi_hotel_pos_schema.sql). It models the hotel, shared permissions, per-hotel roles and staff, menu categories and items, orders, payments, receipt snapshots, refunds, and audit records.

Tenant-owned tables carry `hotel_id`. Foreign keys between tenant-owned rows use both `hotel_id` and the referenced row ID, preventing cross-hotel associations at the database layer. Tenant-scoped natural identifiers such as usernames, order numbers, and receipt numbers are unique per hotel, so the same value may appear in another hotel.

`role_permission` implements the permission-to-role many-to-many relationship shown in the diagram. `JSONB` stores receipt configuration and saved receipt snapshots. Menu rows are intended to be deactivated through their availability flags rather than deleted, preserving historical order item snapshots.

The SQL is a PostgreSQL schema artifact. The backend is currently a scaffold and does not yet include a migration runner or persistence entities.
