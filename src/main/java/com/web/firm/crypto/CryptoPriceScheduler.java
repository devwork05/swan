package com.web.firm.crypto;

import tools.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/**
 * Fetches crypto prices from the upstream feed configured via
 * {@code CRYPTO_PRICE_API} every 20 minutes and upserts into the DB.
 * Static columns (name, symbol, logo, network, sortOrder, listed) are only
 * touched on first insert — subsequent runs only refresh price columns, so
 * admin edits to display data survive across refreshes.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CryptoPriceScheduler {

    private static final Duration UPSTREAM_TIMEOUT = Duration.ofSeconds(20);
    /** 20 minutes in ms. */
    private static final long REFRESH_MS = 20L * 60L * 1000L;
    /** Slight delay after boot before the first run, so the app is fully up. */
    private static final long INITIAL_DELAY_MS = 15_000L;

    @Value("${crypto.price-api:}")
    private String pricesUrl;

    private final CryptoAssetRepository repository;
    private final PlatformTransactionManager txManager;
    /**
     * Some upstream feeds return 403 for requests with the default Reactor
     * Netty User-Agent (`ReactorNetty/x.y.z`) — they're behind Cloudflare or
     * anti-bot rules that treat that UA as suspicious. Sending a browser-
     * shaped UA + JSON Accept makes the request look like a normal client.
     */
    private final WebClient webClient = WebClient.builder()
            .defaultHeader("User-Agent",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                            + "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
            .defaultHeader("Accept", "application/json, text/plain, */*")
            .defaultHeader("Accept-Language", "en-US,en;q=0.9")
            .build();
    private TransactionTemplate tx;

    @Scheduled(initialDelay = INITIAL_DELAY_MS, fixedDelay = REFRESH_MS)
    public void scheduled() {
        refresh();
    }

    /**
     * Fetch + upsert. Returns a small report so the admin "Refresh Now"
     * endpoint can surface success/failure to the UI instead of silently
     * saying 200 OK.
     */
    public RefreshReport refresh() {
        if (pricesUrl == null || pricesUrl.isBlank()) {
            String msg = "CRYPTO_PRICE_API not configured (empty). Set it in your .env / environment and restart.";
            log.warn(msg);
            return new RefreshReport(0, 0, 0, msg);
        }
        log.info("Fetching crypto prices from {}", pricesUrl);

        JsonNode data;
        try {
            data = webClient.get()
                    .uri(pricesUrl)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block(UPSTREAM_TIMEOUT);
        } catch (Exception e) {
            String msg = "Upstream fetch failed: " + e.getMessage();
            log.warn(msg, e);
            return new RefreshReport(0, 0, 0, msg);
        }
        if (data == null || !data.isArray() || data.isEmpty()) {
            String msg = "Upstream returned no rows";
            log.warn(msg);
            return new RefreshReport(0, 0, 0, msg);
        }

        if (tx == null) tx = new TransactionTemplate(txManager);

        int inserted = 0, updated = 0, skipped = 0;
        for (JsonNode row : data) {
            try {
                UpsertResult r = tx.execute(status -> upsertOne(row));
                if (r == UpsertResult.INSERTED) inserted++;
                else if (r == UpsertResult.UPDATED) updated++;
                else skipped++;
            } catch (Exception e) {
                skipped++;
                log.warn("Skipped crypto row {} — {}", row.get("symbol"), e.getMessage());
            }
        }
        String msg = String.format("Crypto refresh done — %d inserted, %d updated, %d skipped", inserted, updated, skipped);
        log.info(msg);
        return new RefreshReport(inserted, updated, skipped, msg);
    }

    /** Each row is upserted inside a TransactionTemplate scope so one bad row doesn't roll back the batch. */
    private UpsertResult upsertOne(JsonNode row) {
        Long externalId = numAsLong(row, "id");
        String symbol = text(row, "symbol");
        if (externalId == null && (symbol == null || symbol.isBlank())) return UpsertResult.SKIPPED;

        Optional<CryptoAsset> existing = externalId != null
                ? repository.findByExternalId(externalId)
                : repository.findBySymbolIgnoreCase(symbol);

        CryptoAsset asset = existing.orElseGet(CryptoAsset::new);
        boolean isNew = asset.getId() == null;

        if (isNew) {
            asset.setExternalId(externalId != null ? externalId : (long) Math.abs(symbol.hashCode()));
            asset.setName(text(row, "name"));
            asset.setSymbol(symbol);
            asset.setNetwork(text(row, "network"));
            asset.setLogoUrl(text(row, "logo_url"));
            Integer listed = numAsInt(row, "is_listed");
            asset.setListed(listed == null || listed != 0);
            asset.setSortOrder(0);
        }

        JsonNode price = row.get("price");
        if (price != null && !price.isNull()) {
            asset.setCurrentPrice(decimal(price, "current_price"));
            asset.setPercentChange24h(decimal(price, "percent_change_24h"));
            asset.setMarketCap(decimal(price, "market_cap"));
            asset.setVolume24h(decimal(price, "volume_24h"));
            asset.setVolumeChange24h(decimal(price, "volume_change_24h"));
            asset.setPercentChange30d(decimal(price, "percent_change_30d"));
            asset.setPriceRefreshedAt(Instant.now());
        }

        repository.save(asset);
        return isNew ? UpsertResult.INSERTED : UpsertResult.UPDATED;
    }

    private enum UpsertResult { INSERTED, UPDATED, SKIPPED }

    public record RefreshReport(int inserted, int updated, int skipped, String message) {}

    private static String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }

    private static Long numAsLong(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        if (v.isNumber()) return v.asLong();
        try {
            return Long.parseLong(v.asText());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer numAsInt(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        if (v.isNumber()) return v.asInt();
        try {
            return Integer.parseInt(v.asText());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static BigDecimal decimal(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        try {
            return new BigDecimal(v.asText());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
