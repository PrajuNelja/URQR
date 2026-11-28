package com.nelja.urqr.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Map;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class RlsAndAtomicityIntegrationTest {

    private static final String APP_PASSWORD = "test-app-password";

    @Container
    private static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:18.7-alpine")
                    .withDatabaseName("urqr")
                    .withUsername("urqr")
                    .withPassword("test-migration-password");

    @BeforeAll
    static void migrateSchema() {
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .placeholders(Map.of("appDbPassword", APP_PASSWORD))
                .load()
                .migrate();
    }

    @Test
    void hotelASeesOnlyItsRowsAndRuntimeRoleCannotBypassRls() throws Exception {
        String hotelA = UUID.randomUUID().toString();
        String hotelB = UUID.randomUUID().toString();
        UUID categoryA = UUID.randomUUID();
        UUID categoryB = UUID.randomUUID();

        try (Connection owner = ownerConnection();
                PreparedStatement hotel = owner.prepareStatement("""
                        INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                        VALUES (?, ?, 'INR', 'Asia/Kolkata', '00:00', 'ACTIVE', now())
                        """)) {
            hotel.setObject(1, hotelA);
            hotel.setString(2, "Hotel A");
            hotel.executeUpdate();
            hotel.setObject(1, hotelB);
            hotel.setString(2, "Hotel B");
            hotel.executeUpdate();
        }
        insertCategory(hotelA, categoryA);
        insertCategory(hotelB, categoryB);

        try (Connection app = appConnection()) {
            app.setAutoCommit(false);
            try (Statement statement = app.createStatement()) {
                statement.execute("SELECT set_config('app.hotel_id', '" + hotelA + "', true)");
                assertEquals(1, count(statement, "SELECT count(*) FROM menu_category"));
                assertEquals(0, count(statement, "SELECT count(*) FROM menu_category WHERE id = '" + categoryB + "'"));
                assertEquals(0, count(statement, "SELECT count(*) FROM menu_category WHERE hotel_id = '" + hotelB + "'"));
                app.commit();
            }
        }

        try (Connection owner = ownerConnection();
                PreparedStatement query = owner.prepareStatement(
                        "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'urqr_app'");
                ResultSet result = query.executeQuery()) {
            result.next();
            assertFalse(result.getBoolean(1));
            assertFalse(result.getBoolean(2));
        }
    }

    @Test
    void orderItemsPaymentsAndOutboxRollbackTogether() throws Exception {
        String hotel = UUID.randomUUID().toString();
        UUID role = UUID.randomUUID();
        UUID user = UUID.randomUUID();
        UUID category = UUID.randomUUID();
        UUID menuItem = UUID.randomUUID();
        UUID order = UUID.randomUUID();
        UUID event = UUID.randomUUID();
        try (Connection owner = ownerConnection()) {
            owner.setAutoCommit(false);
            try (PreparedStatement insertHotel = owner.prepareStatement(
                    "INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at) VALUES (?,?,?,'Asia/Kolkata','06:00','ACTIVE',now())");
                    PreparedStatement insertRole = owner.prepareStatement(
                    "INSERT INTO hotel_role(id,hotel_id,name) VALUES (?,?,?)");
                    PreparedStatement insertUser = owner.prepareStatement(
                    "INSERT INTO staff_user(id,hotel_id,username,password_hash,role_id,status,created_at) VALUES (?,?,?,?,?,'ACTIVE',now())");
                    PreparedStatement insertCategory = owner.prepareStatement(
                    "INSERT INTO menu_category(id,hotel_id,name,active) VALUES (?,?,?,true)");
                    PreparedStatement insertItem = owner.prepareStatement(
                    "INSERT INTO menu_item(id,hotel_id,category_id,name,price,available,active) VALUES (?,?,?,?,100,true,true)")) {
                insertHotel.setObject(1, hotel); insertHotel.setString(2, "Atomic Hotel");
                insertHotel.setString(3, "INR"); insertHotel.executeUpdate();
                insertRole.setObject(1, role); insertRole.setObject(2, hotel);
                insertRole.setString(3, "MANAGER"); insertRole.executeUpdate();
                insertUser.setObject(1, user); insertUser.setObject(2, hotel);
                insertUser.setString(3, "manager"); insertUser.setString(4, "hash");
                insertUser.setObject(5, role); insertUser.executeUpdate();
                insertCategory.setObject(1, category); insertCategory.setObject(2, hotel);
                insertCategory.setString(3, "Food"); insertCategory.executeUpdate();
                insertItem.setObject(1, menuItem); insertItem.setObject(2, hotel);
                insertItem.setObject(3, category); insertItem.setString(4, "Meal"); insertItem.executeUpdate();
            }
            owner.commit();
        }

        try (Connection app = appConnection()) {
            app.setAutoCommit(false);
            try (Statement context = app.createStatement()) {
                context.execute("SELECT set_config('app.hotel_id', '" + hotel + "', true)");
            }
            try {
                try (PreparedStatement insertOrder = app.prepareStatement("""
                        INSERT INTO pos_order(id,hotel_id,order_number,status,payment_status,subtotal,grand_total,
                            created_by,created_at,updated_at) VALUES (?,?,?,'COMPLETED','PAID',100,100,?,now(),now())
                        """)) {
                    insertOrder.setObject(1, order); insertOrder.setObject(2, hotel);
                    insertOrder.setString(3, "ROLLBACK"); insertOrder.setObject(4, user);
                    insertOrder.executeUpdate();
                }
                try (PreparedStatement insertLine = app.prepareStatement("""
                        INSERT INTO order_item(id,hotel_id,order_id,menu_item_id,name_snapshot,price_snapshot,
                            quantity,line_total) VALUES (?,?,?,?,?,100,1,100)
                        """)) {
                    insertLine.setObject(1, UUID.randomUUID()); insertLine.setObject(2, hotel);
                    insertLine.setObject(3, order); insertLine.setObject(4, menuItem);
                    insertLine.setString(5, "Meal"); insertLine.executeUpdate();
                }
                try (PreparedStatement insertPayment = app.prepareStatement("""
                        INSERT INTO payment(id,hotel_id,order_id,method,amount,created_at) VALUES (?,?,?,'CASH',100,now())
                        """)) {
                    insertPayment.setObject(1, UUID.randomUUID()); insertPayment.setObject(2, hotel);
                    insertPayment.setObject(3, order); insertPayment.executeUpdate();
                }
                try (PreparedStatement insertEvent = app.prepareStatement("""
                        INSERT INTO outbox_events(event_id,hotel_id,aggregate_type,aggregate_id,event_type,payload)
                        VALUES (?,?, 'Order', ?, 'ORDER_CREATED', '{"orderId":"rollback"}'::jsonb)
                        """)) {
                insertEvent.setObject(1, event); insertEvent.setObject(2, hotel);
                    insertEvent.setObject(3, order); insertEvent.executeUpdate();
                }
                throw new IllegalStateException("simulate a failure after all writes");
            } catch (IllegalStateException expected) {
                app.rollback();
            }
        }

        try (Connection owner = ownerConnection(); Statement statement = owner.createStatement()) {
            assertEquals(0, count(statement, "SELECT count(*) FROM pos_order WHERE id='" + order + "'"));
            assertEquals(0, count(statement, "SELECT count(*) FROM order_item WHERE order_id='" + order + "'"));
            assertEquals(0, count(statement, "SELECT count(*) FROM payment WHERE order_id='" + order + "'"));
            assertEquals(0, count(statement, "SELECT count(*) FROM outbox_events WHERE event_id='" + event + "'"));
        }
    }

    private static void insertCategory(String hotelId, UUID categoryId) throws Exception {
        try (Connection owner = ownerConnection();
                PreparedStatement insert = owner.prepareStatement(
                        "INSERT INTO menu_category(id,hotel_id,name,active) VALUES (?,?,?,true)")) {
            insert.setObject(1, categoryId);
            insert.setObject(2, hotelId);
            insert.setString(3, "Category " + categoryId);
            insert.executeUpdate();
        }
    }

    private static int count(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getInt(1);
        }
    }

    private static Connection ownerConnection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private static Connection appConnection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), "urqr_app", APP_PASSWORD);
    }
}
