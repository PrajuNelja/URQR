import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPairGenerator;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/** Generates local RS256 keys and writes them to this directory's ignored .env file. */
class GenerateJwtKeys {
    public static void main(String[] args) throws Exception {
        boolean force = args.length == 1 && "--force".equals(args[0]);
        if (args.length > 1 || (args.length == 1 && !force)) {
            throw new IllegalArgumentException("Usage: java generate-jwt-keys.java [--force]");
        }

        Path envFile = Path.of(".env");
        List<String> lines = Files.exists(envFile)
                ? Files.readAllLines(envFile, StandardCharsets.UTF_8)
                : Files.readAllLines(Path.of(".env.example"), StandardCharsets.UTF_8);
        boolean hasConfiguredKey = lines.stream()
                .filter(line -> line.startsWith("JWT_PRIVATE_KEY=") || line.startsWith("JWT_PUBLIC_KEY="))
                .map(line -> line.substring(line.indexOf('=') + 1).trim())
                .anyMatch(value -> !value.isEmpty() && !value.startsWith("replace-with-"));
        if (hasConfiguredKey && !force) {
            throw new IllegalStateException("JWT keys already exist in .env. Use --force only when you intend to rotate them.");
        }

        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        var keyPair = generator.generateKeyPair();
        String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());
        String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());

        List<String> updated = new ArrayList<>();
        for (String line : lines) {
            if (!line.startsWith("JWT_PRIVATE_KEY=") && !line.startsWith("JWT_PUBLIC_KEY=")
                    && !line.startsWith("JWT_SECRET=")) {
                updated.add(line);
            }
        }
        updated.add("JWT_PRIVATE_KEY=" + privateKey);
        updated.add("JWT_PUBLIC_KEY=" + publicKey);
        if (updated.stream().noneMatch(line -> line.startsWith("CORS_ALLOWED_ORIGINS="))) {
            updated.add("CORS_ALLOWED_ORIGINS=http://localhost:5173");
        }

        Files.writeString(envFile, String.join(System.lineSeparator(), updated) + System.lineSeparator(),
                StandardCharsets.UTF_8);
        System.out.println("Generated a 2048-bit RSA key pair in .env. The private key was not displayed.");
    }
}
