package com.nelja.urqr;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.nelja.urqr.analytics.DailySalesService;
import com.nelja.urqr.auth.security.TenantRlsContext;
import com.nelja.urqr.billing.catalog.entity.BillingCategory;
import com.nelja.urqr.billing.catalog.repository.BillingCategoryRepository;
import com.nelja.urqr.billing.order.PosOrderService.LineInput;
import com.nelja.urqr.billing.order.PosOrderService;
import com.nelja.urqr.billing.outbox.OutboxWriter;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Boots the real application against disposable PostgreSQL and Redis services. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers(disabledWithoutDocker = true)
class UrqrServerApplicationTests {

    private static final String APP_PASSWORD = "test-app-password";
    private static final String CENTRIFUGO_API_KEY = "test-centrifugo-api-key";
    private static final KeyPair TEST_RSA_KEY_PAIR = generateRsaKeyPair();

    @Container
    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.7-alpine")
            .withDatabaseName("urqr")
            .withUsername("urqr")
            .withPassword("test-migration-password");

    @Container
    private static final GenericContainer<?> REDIS = new GenericContainer<>("redis:8.2.11-alpine")
            .withExposedPorts(6379);

    @Container
    private static final GenericContainer<?> CENTRIFUGO = new GenericContainer<>("centrifugo/centrifugo:v6.10.3")
            .withFileSystemBind(Path.of("..", "..", "infrastructure", "docker", "centrifugo", "config.json")
                    .toAbsolutePath().normalize().toString(), "/centrifugo/config.json", BindMode.READ_ONLY)
            .withCommand("centrifugo", "--config=/centrifugo/config.json")
            .withEnv("CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY", "test-centrifugo-token-secret")
            .withEnv("CENTRIFUGO_HTTP_API_KEY", CENTRIFUGO_API_KEY)
            .withEnv("CENTRIFUGO_ADMIN_PASSWORD", "test-centrifugo-admin-password")
            .withEnv("CENTRIFUGO_ADMIN_SECRET", "test-centrifugo-admin-secret")
            .withExposedPorts(8000, 9000)
            .waitingFor(Wait.forHttp("/health").forPort(9000).forStatusCode(200));

    @Autowired
    private StringRedisTemplate redis;

    @Autowired
    private DailySalesService dailySales;

    @Autowired
    private PosOrderService orders;

    @Autowired
    private OutboxWriter outbox;

    @Autowired
    private TenantRlsContext rlsContext;

    @Autowired
    private BillingCategoryRepository billingCategories;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @DynamicPropertySource
    static void applicationProperties(DynamicPropertyRegistry registry) {
        registry.add("DB_URL", POSTGRES::getJdbcUrl);
        registry.add("DB_MIGRATION_USER", POSTGRES::getUsername);
        registry.add("DB_MIGRATION_PASSWORD", POSTGRES::getPassword);
        registry.add("APP_DB_USER", () -> "urqr_app");
        registry.add("APP_DB_PASSWORD", () -> APP_PASSWORD);
        registry.add("JWT_PRIVATE_KEY", () -> encode(TEST_RSA_KEY_PAIR.getPrivate().getEncoded()));
        registry.add("JWT_PUBLIC_KEY", () -> encode(TEST_RSA_KEY_PAIR.getPublic().getEncoded()));
        registry.add("PLATFORM_ADMIN_PASSWORD", () -> "test-only-platform-admin-password");
        registry.add("REDIS_URL", () -> "redis://" + REDIS.getHost() + ":" + REDIS.getMappedPort(6379) + "/0");
        registry.add("CENTRIFUGO_API_URL", () -> "http://" + CENTRIFUGO.getHost() + ":"
                + CENTRIFUGO.getMappedPort(8000) + "/api");
        registry.add("CENTRIFUGO_API_KEY", () -> CENTRIFUGO_API_KEY);
        registry.add("OUTBOX_ENABLED", () -> "true");
        registry.add("OUTBOX_POLL_DELAY_MS", () -> "25");
    }

    @Test
    void startsWithValidatedHibernateSchemaAndConnectedRedis() {
        assertNotNull(redis.getConnectionFactory());
        try (RedisConnection connection = redis.getConnectionFactory().getConnection()) {
            assertEquals("PONG", connection.ping());
        }
    }

    @Test
    void publishesCatalogContractAsOpenApi31() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").value("3.1.0"))
                .andExpect(jsonPath("$.paths['/api/v1/catalog/products']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/catalog/categories']").exists());
    }

    @Test
    void persistsAndReadsTenantOwnedCategoryThroughSpringDataJpa() throws Exception {
        UUID tenantId = UUID.randomUUID();
        insertTenant(tenantId);
        setTenantAuthentication(tenantId);
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);

        try {
            UUID categoryId = transaction.execute(status -> {
                rlsContext.bindTenant(tenantId);
                BillingCategory saved = billingCategories.saveAndFlush(
                        new BillingCategory(null, "JPA CRUD " + tenantId));
                assertEquals(tenantId, saved.getTenantId());
                return saved.getId();
            });

            BillingCategory loaded = transaction.execute(status -> {
                rlsContext.bindTenant(tenantId);
                return billingCategories.findById(categoryId).orElseThrow();
            });
            assertEquals("JPA CRUD " + tenantId, loaded.getName());
            assertEquals(tenantId, loaded.getTenantId());

            transaction.executeWithoutResult(status -> {
                rlsContext.bindTenant(tenantId);
                billingCategories.deleteById(categoryId);
            });
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void bindsTheAuthenticatedTenantToTheSpringTransaction() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID userId = insertHotelWithPaidOrder(tenantId);
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "RS256")
                .claim("hotel_id", tenantId.toString())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_MANAGER"))));

        try {
            DailySalesService.Report report = dailySales.report(
                    tenantId, LocalDate.now(ZoneId.of("Asia/Kolkata")));
            assertEquals(new BigDecimal("100.00"), report.totalPayments());
            assertEquals(1, report.ordersWithPayments());

            insertOrders(tenantId, userId, 1_000);
            printOrderSearchPlan(tenantId);
            for (int i = 0; i < 5; i++) {
                orders.list(tenantId, null, null, null, PageRequest.of(0, 20));
            }
            long[] samples = new long[30];
            for (int i = 0; i < samples.length; i++) {
                long started = System.nanoTime();
                var page = orders.list(tenantId, null, null, null, PageRequest.of(0, 20));
                samples[i] = System.nanoTime() - started;
                assertEquals(1_001, page.getTotalElements());
            }
            Arrays.sort(samples);
            double p95Millis = samples[28] / 1_000_000.0;
            System.out.printf("ORDER_LIST_PAGE_20_P95_MS=%.3f%n", p95Millis);
            // Docker Desktop load varies substantially; set -Dperformance.enforce=true to gate the target.
            if (Boolean.getBoolean("performance.enforce")) {
                assertTrue(p95Millis < 50.0, "Order list p95 must stay under 50ms");
            }
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void completesConcurrentBillingRequestsWithoutDeadlockOrPoolStarvation() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID userId = insertHotelWithMenuItem(tenantId);
        UUID menuItemId = findMenuItem(tenantId);
        int workerCount = 16;
        int ordersToCreate = 80;
        var executor = Executors.newFixedThreadPool(workerCount);
        List<Future<PosOrderService.OrderView>> futures = new ArrayList<>();
        long started = System.nanoTime();

        for (int i = 0; i < ordersToCreate; i++) {
            futures.add(executor.submit(() -> {
                setTenantAuthentication(tenantId);
                try {
                    return orders.create(tenantId, userId, List.of(new LineInput(menuItemId, 1)), List.of());
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }));
        }

        try {
            for (Future<PosOrderService.OrderView> future : futures) {
                assertNotNull(future.get(30, TimeUnit.SECONDS));
            }
        } finally {
            executor.shutdownNow();
        }

        long elapsedMillis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
        System.out.printf("CONCURRENT_ORDER_BURST_%d_MS=%d%n", ordersToCreate, elapsedMillis);
        assertEquals(ordersToCreate, countOrders(tenantId));
    }

    @Test
    void deliversOutboxEventsToCentrifugoWithinTheLatencyTarget() throws Exception {
        UUID tenantId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement tenant = owner.prepareStatement(
                        "INSERT INTO tenants(id,name,slug) VALUES (?,?,?)")) {
            tenant.setObject(1, tenantId);
            tenant.setString(2, "Outbox tenant " + tenantId);
            tenant.setString(3, "outbox-" + tenantId);
            tenant.executeUpdate();
        }

        List<UUID> eventIds = new ArrayList<>();
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        long transactionStarted = System.nanoTime();
        transaction.executeWithoutResult(status -> {
            rlsContext.bindTenant(tenantId);
            for (int sequence = 0; sequence < 20; sequence++) {
                eventIds.add(outbox.enqueue(tenantId, "LATENCY_TEST", "Test", tenantId,
                        java.util.Map.of("sequence", sequence)));
            }
        });
        System.out.printf("OUTBOX_ENQUEUE_TRANSACTION_MS=%.3f%n",
                (System.nanoTime() - transactionStarted) / 1_000_000.0);

        long deliveryWaitStarted = System.nanoTime();
        long deadline = System.nanoTime() + 10_000_000_000L;
        while (countDelivered(tenantId) < eventIds.size() && System.nanoTime() < deadline) {
            Thread.sleep(5);
        }
        assertEquals(eventIds.size(), countDelivered(tenantId));
        System.out.printf("OUTBOX_COMMIT_TO_ACK_ALL_MS=%.3f%n",
                (System.nanoTime() - deliveryWaitStarted) / 1_000_000.0);

        List<Double> latencies = deliveryLatenciesMillis(tenantId);
        latencies.sort(Double::compareTo);
        double burstP95Millis = latencies.get((int) Math.ceil(latencies.size() * 0.95) - 1);
        System.out.printf("OUTBOX_BURST_20_P95_MS=%.3f%n", burstP95Millis);
        if (Boolean.getBoolean("performance.enforce")) {
            assertTrue(burstP95Millis < 150.0, "Burst outbox p95 must stay under 150ms");
        }

        // Measure steady traffic separately after the HTTP connection and outbox path are warm.
        List<Double> steadyLatencies = new ArrayList<>();
        for (int sequence = 0; sequence < 20; sequence++) {
            UUID eventId = enqueueEvent(tenantId, sequence, "LATENCY_STEADY");
            long eventDeadline = System.nanoTime() + 10_000_000_000L;
            while (!isDelivered(eventId) && System.nanoTime() < eventDeadline) Thread.sleep(5);
            assertTrue(isDelivered(eventId), "Steady-state outbox event was not delivered");
            steadyLatencies.add(deliveryLatencyMillis(tenantId, eventId));
        }
        steadyLatencies.sort(Double::compareTo);
        double steadyP95Millis = steadyLatencies.get((int) Math.ceil(steadyLatencies.size() * 0.95) - 1);
        System.out.printf("OUTBOX_STEADY_SINGLE_EVENT_P95_MS=%.3f%n", steadyP95Millis);
        if (Boolean.getBoolean("performance.enforce")) {
            assertTrue(steadyP95Millis < 150.0, "Warm steady-state outbox p95 must stay under 150ms");
        }
    }

    private static int countDelivered(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT count(*) FROM outbox_events
                         WHERE tenant_id = ? AND event_type = 'LATENCY_TEST' AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, tenantId);
            try (var result = query.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static List<Double> deliveryLatenciesMillis(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT extract(epoch FROM (delivered_at - created_at)) * 1000.0
                          FROM outbox_events
                         WHERE tenant_id = ? AND event_type = 'LATENCY_TEST' AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, tenantId);
            try (var result = query.executeQuery()) {
                List<Double> values = new ArrayList<>();
                while (result.next()) values.add(result.getDouble(1));
                return values;
            }
        }
    }

    private UUID enqueueEvent(UUID tenantId, int sequence, String eventType) {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        return transaction.execute(status -> {
            rlsContext.bindTenant(tenantId);
            return outbox.enqueue(tenantId, eventType, "Test", tenantId,
                    java.util.Map.of("sequence", sequence));
        });
    }

    private static boolean isDelivered(UUID eventId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement(
                        "SELECT state = 'DELIVERED' FROM outbox_events WHERE event_id = ?")) {
            query.setObject(1, eventId);
            try (var result = query.executeQuery()) {
                return result.next() && result.getBoolean(1);
            }
        }
    }

    private static double deliveryLatencyMillis(UUID tenantId, UUID eventId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT extract(epoch FROM (delivered_at - created_at)) * 1000.0
                          FROM outbox_events
                         WHERE tenant_id = ? AND event_id = ? AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, tenantId);
            query.setObject(2, eventId);
            try (var result = query.executeQuery()) {
                if (!result.next()) throw new IllegalStateException("Outbox event was not acknowledged");
                return result.getDouble(1);
            }
        }
    }

    private static UUID insertHotelWithPaidOrder(UUID tenantId) throws Exception {
        UUID roleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())) {
            owner.setAutoCommit(false);
            try (PreparedStatement tenant = owner.prepareStatement(
                    "INSERT INTO tenants(id,name,slug) VALUES (?,?,?)");
                    PreparedStatement hotel = owner.prepareStatement("""
                    INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                    VALUES (?, 'Tenant test hotel', 'INR', 'Asia/Kolkata', '00:00', 'ACTIVE', now())
                    """);
                    PreparedStatement role = owner.prepareStatement(
                            "INSERT INTO hotel_role(id,hotel_id,name) VALUES (?,?, 'MANAGER')");
                    PreparedStatement user = owner.prepareStatement("""
                            INSERT INTO staff_user(id,hotel_id,username,password_hash,role_id,status,created_at)
                            VALUES (?,?, 'manager', 'test-hash', ?, 'ACTIVE', now())
                            """);
                    PreparedStatement order = owner.prepareStatement("""
                            INSERT INTO pos_order(id,hotel_id,order_number,status,payment_status,subtotal,
                                grand_total,created_by,created_at,updated_at)
                            VALUES (?,?,?,'COMPLETED','PAID',100,100,?,now(),now())
                            """);
                    PreparedStatement payment = owner.prepareStatement("""
                            INSERT INTO payment(id,hotel_id,order_id,method,amount,created_at)
                            VALUES (?,?,?,'CASH',100,now())
                            """)) {
                tenant.setObject(1, tenantId);
                tenant.setString(2, "Tenant " + tenantId);
                tenant.setString(3, "tenant-" + tenantId);
                tenant.executeUpdate();
                hotel.setObject(1, tenantId);
                hotel.executeUpdate();
                role.setObject(1, roleId);
                role.setObject(2, tenantId);
                role.executeUpdate();
                user.setObject(1, userId);
                user.setObject(2, tenantId);
                user.setObject(3, roleId);
                user.executeUpdate();
                order.setObject(1, orderId);
                order.setObject(2, tenantId);
                order.setString(3, "TEST-" + orderId.toString().substring(0, 8));
                order.setObject(4, userId);
                order.executeUpdate();
                payment.setObject(1, UUID.randomUUID());
                payment.setObject(2, tenantId);
                payment.setObject(3, orderId);
                payment.executeUpdate();
            }
            owner.commit();
        }
        return userId;
    }

    private static void insertTenant(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement tenant = owner.prepareStatement(
                        "INSERT INTO tenants(id,name,slug) VALUES (?,?,?)")) {
            tenant.setObject(1, tenantId);
            tenant.setString(2, "Tenant " + tenantId);
            tenant.setString(3, "tenant-" + tenantId);
            tenant.executeUpdate();
        }
    }

    private static UUID insertHotelWithMenuItem(UUID tenantId) throws Exception {
        UUID roleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID menuItemId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())) {
            owner.setAutoCommit(false);
            try (PreparedStatement tenant = owner.prepareStatement(
                    "INSERT INTO tenants(id,name,slug) VALUES (?,?,?)");
                    PreparedStatement hotel = owner.prepareStatement("""
                    INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                    VALUES (?, 'Load hotel', 'INR', 'Asia/Kolkata', '06:00', 'ACTIVE', now())
                    """);
                    PreparedStatement role = owner.prepareStatement(
                            "INSERT INTO hotel_role(id,hotel_id,name) VALUES (?,?, 'MANAGER')");
                    PreparedStatement user = owner.prepareStatement("""
                    INSERT INTO staff_user(id,hotel_id,username,password_hash,role_id,status,created_at)
                    VALUES (?,?, 'manager', 'test-hash', ?, 'ACTIVE', now())
                    """);
                    PreparedStatement category = owner.prepareStatement(
                            "INSERT INTO menu_category(id,hotel_id,name,active) VALUES (?,?, 'Food', true)");
                    PreparedStatement item = owner.prepareStatement("""
                    INSERT INTO menu_item(id,hotel_id,category_id,name,price,available,active)
                    VALUES (?,?,?,'Meal',100,true,true)
                    """)) {
                tenant.setObject(1, tenantId);
                tenant.setString(2, "Load tenant " + tenantId);
                tenant.setString(3, "load-" + tenantId);
                tenant.executeUpdate();
                hotel.setObject(1, tenantId);
                hotel.executeUpdate();
                role.setObject(1, roleId);
                role.setObject(2, tenantId);
                role.executeUpdate();
                user.setObject(1, userId);
                user.setObject(2, tenantId);
                user.setObject(3, roleId);
                user.executeUpdate();
                category.setObject(1, categoryId);
                category.setObject(2, tenantId);
                category.executeUpdate();
                item.setObject(1, menuItemId);
                item.setObject(2, tenantId);
                item.setObject(3, categoryId);
                item.executeUpdate();
            }
            owner.commit();
        }
        return userId;
    }

    private static UUID findMenuItem(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement(
                        "SELECT id FROM menu_item WHERE hotel_id=? AND name='Meal'")) {
            query.setObject(1, tenantId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw new IllegalStateException("Load fixture menu item was not inserted");
                return rows.getObject(1, UUID.class);
            }
        }
    }

    private static int countOrders(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement(
                        "SELECT count(*) FROM pos_order WHERE hotel_id=?")) {
            query.setObject(1, tenantId);
            try (var rows = query.executeQuery()) {
                rows.next();
                return rows.getInt(1);
            }
        }
    }

    private static void setTenantAuthentication(UUID tenantId) {
        Jwt jwt = Jwt.withTokenValue("load-test-token")
                .header("alg", "none")
                .claim("hotel_id", tenantId.toString())
                .claim("roles", List.of("MANAGER"))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt,
                List.of(new SimpleGrantedAuthority("ROLE_MANAGER"))));
    }

    private static void printOrderSearchPlan(UUID tenantId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                Statement analyze = owner.createStatement()) {
            analyze.execute("ANALYZE pos_order");
            try (PreparedStatement explain = owner.prepareStatement("""
                    EXPLAIN (ANALYZE, BUFFERS)
                    SELECT id FROM pos_order
                    WHERE hotel_id=?
                    ORDER BY created_at DESC, id DESC
                    LIMIT 20
                    """)) {
                explain.setObject(1, tenantId);
                try (var rows = explain.executeQuery()) {
                    StringBuilder plan = new StringBuilder();
                    while (rows.next()) plan.append(rows.getString(1)).append(System.lineSeparator());
                    System.out.println("ORDER_SEARCH_EXPLAIN_ANALYZE:\n" + plan);
                    assertTrue(plan.length() > 0, "PostgreSQL should return an execution plan");
                    assertTrue(plan.toString().contains("idx_order_search_created_id"),
                            "Order search should use the index that matches the page sort");
                }
            }
        }
    }

    private static void insertOrders(UUID tenantId, UUID userId, int count) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement order = owner.prepareStatement("""
                        INSERT INTO pos_order(id,hotel_id,order_number,status,payment_status,subtotal,
                            discount_total,tax_total,grand_total,created_by,created_at,updated_at)
                        VALUES (?,?,?,'OPEN','UNPAID',0,0,0,0,?, now() - (? * interval '1 second'), now())
                        """)) {
            owner.setAutoCommit(false);
            for (int i = 0; i < count; i++) {
                order.setObject(1, UUID.randomUUID());
                order.setObject(2, tenantId);
                order.setString(3, "PERF-" + i);
                order.setObject(4, userId);
                order.setInt(5, i);
                order.addBatch();
            }
            order.executeBatch();
            owner.commit();
        }
    }

    private static String encode(byte[] key) {
        return Base64.getEncoder().encodeToString(key);
    }

    private static KeyPair generateRsaKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }
}
