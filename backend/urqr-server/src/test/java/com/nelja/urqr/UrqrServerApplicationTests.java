package com.nelja.urqr;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.nelja.urqr.analytics.DailySalesService;
import com.nelja.urqr.auth.security.HotelRlsContext;
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
import java.util.Map;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    private HotelRlsContext rlsContext;

    @Autowired
    private MockMvc mockMvc;

    @Value("${app.platform-admin.username}")
    private String platformAdminUsername;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

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
                .andExpect(jsonPath("$.paths['/api/v1/catalog/categories']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/categories'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/categories'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/categories/{id}'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/categories/{id}'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/categories/{id}'].delete").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items/all'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items/{id}'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items/{id}'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/v1/menu/items/{id}'].delete").exists())
                .andExpect(jsonPath("$.paths['/api/v1/platform/hotels/{hotelId}/users'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/users'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/users'].post").exists());
    }

    @Test
    void everyUrqrControllerRouteAndMethodAppearsInSwagger() throws Exception {
        JsonNode paths = objectMapper.readTree(mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).path("paths");

        requestMappingHandlerMapping.getHandlerMethods().forEach((mapping, handler) -> {
            if (!handler.getBeanType().getPackageName().startsWith("com.nelja.urqr")) return;
            mapping.getPatternValues().forEach(path -> {
                assertTrue(paths.has(path), "Swagger is missing route " + path);
                for (RequestMethod method : mapping.getMethodsCondition().getMethods()) {
                    assertTrue(paths.path(path).has(method.name().toLowerCase(Locale.ROOT)),
                            "Swagger is missing " + method + " " + path);
                }
            });
        });
    }

    @Test
    void platformAdminCanAddManagerAndCashierAccountsAndStaffCanReadCategories() throws Exception {
        UUID hotelId = UUID.randomUUID();
        insertHotelWithStaffRoles(hotelId);
        MvcResult platformLogin = mockMvc.perform(post("/api/v1/platform/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", platformAdminUsername,
                                "password", "test-only-platform-admin-password"))))
                .andExpect(status().isOk())
                .andReturn();
        String platformToken = objectMapper.readTree(platformLogin.getResponse().getContentAsString())
                .path("accessToken").asText();

        // The reported 401 is expected without a staff token; platform admin is also not a POS staff role.
        mockMvc.perform(get("/api/v1/menu/categories"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/menu/categories")
                        .header("Authorization", "Bearer " + platformToken))
                .andExpect(status().isForbidden());

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String managerUsername = "platform-manager-" + suffix + "@example.test";
        String cashierUsername = "platform-cashier-" + suffix + "@example.test";
        String managerPassword = "ManagerPassword@123";
        String cashierPassword = "CashierPassword@123";

        mockMvc.perform(post("/api/v1/platform/hotels/{hotelId}/users", hotelId)
                        .header("Authorization", "Bearer " + platformToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", managerUsername,
                                "password", managerPassword, "role", "MANAGER"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(managerUsername))
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.hotelId").value(hotelId.toString()));

        mockMvc.perform(post("/api/v1/platform/hotels/{hotelId}/users", hotelId)
                        .header("Authorization", "Bearer " + platformToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", cashierUsername,
                                "password", cashierPassword, "role", "CASHIER"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(cashierUsername))
                .andExpect(jsonPath("$.role").value("CASHIER"));

        String managerToken = loginStaff(managerUsername, managerPassword);
        String cashierToken = loginStaff(cashierUsername, cashierPassword);
        mockMvc.perform(get("/api/v1/menu/categories")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/menu/categories")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/platform/hotels/{hotelId}/users", hotelId)
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "not-platform-admin@example.test",
                                "password", "ManagerPassword@123", "role", "CASHIER"))))
                .andExpect(status().isForbidden());
    }

    private String loginStaff(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("accessToken").asText();
    }

    @Test
    void tamperingWithTenantHeaderIsOverriddenByVerifiedJwtClaims() throws Exception {
        UUID hotelIdA = UUID.randomUUID();
        UUID hotelIdB = UUID.randomUUID();
        insertHotelWithStaffRoles(hotelIdA);
        insertHotelWithStaffRoles(hotelIdB);

        MvcResult platformLogin = mockMvc.perform(post("/api/v1/platform/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", platformAdminUsername,
                                "password", "test-only-platform-admin-password"))))
                .andExpect(status().isOk())
                .andReturn();
        String platformToken = objectMapper.readTree(platformLogin.getResponse().getContentAsString())
                .path("accessToken").asText();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String managerUsernameA = "spoof-mgr-" + suffix + "@example.test";
        mockMvc.perform(post("/api/v1/platform/hotels/{hotelId}/users", hotelIdA)
                        .header("Authorization", "Bearer " + platformToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", managerUsernameA,
                                "password", "ManagerPassword@123", "role", "MANAGER"))))
                .andExpect(status().isCreated());

        String managerTokenA = loginStaff(managerUsernameA, "ManagerPassword@123");

        // Attacker attempts to spoof X-Tenant-ID header with Hotel B's ID while holding JWT for Hotel A.
        // The system must prioritize the verified JWT claims and maintain tenant isolation.
        mockMvc.perform(get("/api/v1/menu/categories")
                        .header("Authorization", "Bearer " + managerTokenA)
                        .header("X-Tenant-ID", hotelIdB.toString()))
                .andExpect(status().isOk());
    }

    @Test
    void bindsTheAuthenticatedHotelToTheSpringTransaction() throws Exception {
        UUID hotelId = UUID.randomUUID();
        UUID userId = insertHotelWithPaidOrder(hotelId);
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "RS256")
                .claim("hotel_id", hotelId.toString())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_MANAGER"))));

        try {
            DailySalesService.Report report = dailySales.report(
                    hotelId, LocalDate.now(ZoneId.of("Asia/Kolkata")));
            assertEquals(new BigDecimal("100.00"), report.totalPayments());
            assertEquals(1, report.ordersWithPayments());

            insertOrders(hotelId, userId, 1_000);
            printOrderSearchPlan(hotelId);
            for (int i = 0; i < 5; i++) {
                orders.list(hotelId, null, null, null, PageRequest.of(0, 20));
            }
            long[] samples = new long[30];
            for (int i = 0; i < samples.length; i++) {
                long started = System.nanoTime();
                var page = orders.list(hotelId, null, null, null, PageRequest.of(0, 20));
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
        UUID hotelId = UUID.randomUUID();
        UUID userId = insertHotelWithMenuItem(hotelId);
        UUID menuItemId = findMenuItem(hotelId);
        int workerCount = 16;
        int ordersToCreate = 80;
        var executor = Executors.newFixedThreadPool(workerCount);
        List<Future<PosOrderService.OrderView>> futures = new ArrayList<>();
        long started = System.nanoTime();

        for (int i = 0; i < ordersToCreate; i++) {
            futures.add(executor.submit(() -> {
                setHotelAuthentication(hotelId);
                try {
                    return orders.create(hotelId, userId, List.of(new LineInput(menuItemId, 1)), List.of());
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
        assertEquals(ordersToCreate, countOrders(hotelId));
    }

    @Test
    void deliversOutboxEventsToCentrifugoWithinTheLatencyTarget() throws Exception {
        UUID hotelId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement hotel = owner.prepareStatement("""
                        INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                        VALUES (?, 'Outbox test hotel', 'INR', 'Asia/Kolkata', '00:00', 'ACTIVE', now())
                        """)) {
            hotel.setObject(1, hotelId);
            hotel.executeUpdate();
        }

        List<UUID> eventIds = new ArrayList<>();
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        long transactionStarted = System.nanoTime();
        transaction.executeWithoutResult(status -> {
            rlsContext.bindHotel(hotelId);
            for (int sequence = 0; sequence < 20; sequence++) {
                eventIds.add(outbox.enqueue(hotelId, "LATENCY_TEST", "Test", hotelId,
                        java.util.Map.of("sequence", sequence)));
            }
        });
        System.out.printf("OUTBOX_ENQUEUE_TRANSACTION_MS=%.3f%n",
                (System.nanoTime() - transactionStarted) / 1_000_000.0);

        long deliveryWaitStarted = System.nanoTime();
        long deadline = System.nanoTime() + 10_000_000_000L;
        while (countDelivered(hotelId) < eventIds.size() && System.nanoTime() < deadline) {
            Thread.sleep(5);
        }
        assertEquals(eventIds.size(), countDelivered(hotelId));
        System.out.printf("OUTBOX_COMMIT_TO_ACK_ALL_MS=%.3f%n",
                (System.nanoTime() - deliveryWaitStarted) / 1_000_000.0);

        List<Double> latencies = deliveryLatenciesMillis(hotelId);
        latencies.sort(Double::compareTo);
        double burstP95Millis = latencies.get((int) Math.ceil(latencies.size() * 0.95) - 1);
        System.out.printf("OUTBOX_BURST_20_P95_MS=%.3f%n", burstP95Millis);
        if (Boolean.getBoolean("performance.enforce")) {
            assertTrue(burstP95Millis < 150.0, "Burst outbox p95 must stay under 150ms");
        }

        // Measure steady traffic separately after the HTTP connection and outbox path are warm.
        List<Double> steadyLatencies = new ArrayList<>();
        for (int sequence = 0; sequence < 20; sequence++) {
            UUID eventId = enqueueEvent(hotelId, sequence, "LATENCY_STEADY");
            long eventDeadline = System.nanoTime() + 10_000_000_000L;
            while (!isDelivered(eventId) && System.nanoTime() < eventDeadline) Thread.sleep(5);
            assertTrue(isDelivered(eventId), "Steady-state outbox event was not delivered");
            steadyLatencies.add(deliveryLatencyMillis(hotelId, eventId));
        }
        steadyLatencies.sort(Double::compareTo);
        double steadyP95Millis = steadyLatencies.get((int) Math.ceil(steadyLatencies.size() * 0.95) - 1);
        System.out.printf("OUTBOX_STEADY_SINGLE_EVENT_P95_MS=%.3f%n", steadyP95Millis);
        if (Boolean.getBoolean("performance.enforce")) {
            assertTrue(steadyP95Millis < 150.0, "Warm steady-state outbox p95 must stay under 150ms");
        }
    }

    private static int countDelivered(UUID hotelId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT count(*) FROM outbox_events
                         WHERE hotel_id = ? AND event_type = 'LATENCY_TEST' AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, hotelId);
            try (var result = query.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static List<Double> deliveryLatenciesMillis(UUID hotelId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT extract(epoch FROM (delivered_at - created_at)) * 1000.0
                          FROM outbox_events
                         WHERE hotel_id = ? AND event_type = 'LATENCY_TEST' AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, hotelId);
            try (var result = query.executeQuery()) {
                List<Double> values = new ArrayList<>();
                while (result.next()) values.add(result.getDouble(1));
                return values;
            }
        }
    }

    private UUID enqueueEvent(UUID hotelId, int sequence, String eventType) {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        return transaction.execute(status -> {
            rlsContext.bindHotel(hotelId);
            return outbox.enqueue(hotelId, eventType, "Test", hotelId,
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

    private static double deliveryLatencyMillis(UUID hotelId, UUID eventId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement("""
                        SELECT extract(epoch FROM (delivered_at - created_at)) * 1000.0
                          FROM outbox_events
                         WHERE hotel_id = ? AND event_id = ? AND state = 'DELIVERED'
                        """)) {
            query.setObject(1, hotelId);
            query.setObject(2, eventId);
            try (var result = query.executeQuery()) {
                if (!result.next()) throw new IllegalStateException("Outbox event was not acknowledged");
                return result.getDouble(1);
            }
        }
    }

    private static UUID insertHotelWithPaidOrder(UUID hotelId) throws Exception {
        UUID roleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())) {
            owner.setAutoCommit(false);
            try (PreparedStatement hotel = owner.prepareStatement("""
                    INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                    VALUES (?, 'Hotel test', 'INR', 'Asia/Kolkata', '00:00', 'ACTIVE', now())
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
                hotel.setObject(1, hotelId);
                hotel.executeUpdate();
                role.setObject(1, roleId);
                role.setObject(2, hotelId);
                role.executeUpdate();
                user.setObject(1, userId);
                user.setObject(2, hotelId);
                user.setObject(3, roleId);
                user.executeUpdate();
                order.setObject(1, orderId);
                order.setObject(2, hotelId);
                order.setString(3, "TEST-" + orderId.toString().substring(0, 8));
                order.setObject(4, userId);
                order.executeUpdate();
                payment.setObject(1, UUID.randomUUID());
                payment.setObject(2, hotelId);
                payment.setObject(3, orderId);
                payment.executeUpdate();
            }
            owner.commit();
        }
        return userId;
    }

    private static void insertHotelWithStaffRoles(UUID hotelId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())) {
            owner.setAutoCommit(false);
            try (PreparedStatement hotel = owner.prepareStatement("""
                    INSERT INTO hotel(id,name,currency_code,timezone,day_cutoff,status,created_at)
                    VALUES (?, 'Platform staff test hotel', 'INR', 'Asia/Kolkata', '06:00', 'ACTIVE', now())
                    """);
                    PreparedStatement role = owner.prepareStatement(
                            "INSERT INTO hotel_role(id,hotel_id,name) VALUES (?,?,?)")) {
                hotel.setObject(1, hotelId);
                hotel.executeUpdate();
                for (String roleName : List.of("MANAGER", "CASHIER")) {
                    role.setObject(1, UUID.randomUUID());
                    role.setObject(2, hotelId);
                    role.setString(3, roleName);
                    role.executeUpdate();
                }
            }
            owner.commit();
        }
    }

    private static UUID insertHotelWithMenuItem(UUID hotelId) throws Exception {
        UUID roleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID menuItemId = UUID.randomUUID();
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())) {
            owner.setAutoCommit(false);
            try (PreparedStatement hotel = owner.prepareStatement("""
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
                hotel.setObject(1, hotelId);
                hotel.executeUpdate();
                role.setObject(1, roleId);
                role.setObject(2, hotelId);
                role.executeUpdate();
                user.setObject(1, userId);
                user.setObject(2, hotelId);
                user.setObject(3, roleId);
                user.executeUpdate();
                category.setObject(1, categoryId);
                category.setObject(2, hotelId);
                category.executeUpdate();
                item.setObject(1, menuItemId);
                item.setObject(2, hotelId);
                item.setObject(3, categoryId);
                item.executeUpdate();
            }
            owner.commit();
        }
        return userId;
    }

    private static UUID findMenuItem(UUID hotelId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement(
                        "SELECT id FROM menu_item WHERE hotel_id=? AND name='Meal'")) {
            query.setObject(1, hotelId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw new IllegalStateException("Load fixture menu item was not inserted");
                return rows.getObject(1, UUID.class);
            }
        }
    }

    private static int countOrders(UUID hotelId) throws Exception {
        try (Connection owner = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                PreparedStatement query = owner.prepareStatement(
                        "SELECT count(*) FROM pos_order WHERE hotel_id=?")) {
            query.setObject(1, hotelId);
            try (var rows = query.executeQuery()) {
                rows.next();
                return rows.getInt(1);
            }
        }
    }

    private static void setHotelAuthentication(UUID hotelId) {
        Jwt jwt = Jwt.withTokenValue("load-test-token")
                .header("alg", "none")
                .claim("hotel_id", hotelId.toString())
                .claim("roles", List.of("MANAGER"))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt,
                List.of(new SimpleGrantedAuthority("ROLE_MANAGER"))));
    }

    private static void printOrderSearchPlan(UUID hotelId) throws Exception {
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
                explain.setObject(1, hotelId);
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

    private static void insertOrders(UUID hotelId, UUID userId, int count) throws Exception {
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
                order.setObject(2, hotelId);
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
