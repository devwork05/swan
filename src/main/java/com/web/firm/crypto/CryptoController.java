package com.web.firm.crypto;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Public read-only proxy to the external crypto pricing service (configured via
 * {@code CRYPTO_PRICE_API}) and to Binance's public {@code /api/v3/klines}
 * endpoint for historical candles. Both responses are short-cached (20s) so the
 * dashboards can poll aggressively without hammering the upstream.
 */
@Slf4j
@RestController
@RequestMapping("/crypto")
@RequiredArgsConstructor
public class CryptoController {

    private static final Duration TTL = Duration.ofSeconds(20);

    @Value("${crypto.price-api:}")
    private String pricesUrl;

    @Value("${crypto.klines-api:https://api.binance.com/api/v3/klines}")
    private String klinesUrl;

    private final ObjectMapper objectMapper;
    private final WebClient webClient = WebClient.builder().build();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    /** Full list of listed cryptos with current price data. Passes through as-is. */
    @GetMapping("/prices")
    public ResponseEntity<JsonNode> prices() {
        if (pricesUrl == null || pricesUrl.isBlank()) {
            log.warn("CRYPTO_PRICE_API not configured");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(objectMapper.createArrayNode());
        }
        return ResponseEntity.ok(cachedJson("prices", pricesUrl));
    }

    /**
     * Binance-shaped candlestick data.
     * @param symbol  e.g. "BTC" — we append "USDT" to form the Binance pair.
     * @param interval Binance interval label: 1m,5m,15m,1h,4h,1d.
     * @param limit   max candles to return (default 200, max 1000).
     */
    @GetMapping("/klines")
    public ResponseEntity<JsonNode> klines(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "1h") String interval,
            @RequestParam(defaultValue = "200") int limit) {
        String pair = normalizeToPair(symbol);
        int cappedLimit = Math.min(Math.max(1, limit), 1000);
        String url = klinesUrl + "?symbol=" + pair + "&interval=" + interval + "&limit=" + cappedLimit;
        String key = "klines:" + pair + ":" + interval + ":" + cappedLimit;
        return ResponseEntity.ok(cachedJson(key, url));
    }

    private JsonNode cachedJson(String key, String url) {
        CacheEntry cached = cache.get(key);
        if (cached != null && !cached.expired()) {
            return cached.body;
        }
        try {
            JsonNode fresh = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .onErrorResume(e -> {
                        log.warn("Upstream fetch failed for {}: {}", url, e.getMessage());
                        return Mono.empty();
                    })
                    .block(Duration.ofSeconds(10));
            if (fresh == null) {
                // Fall back to stale cache if we have one; otherwise empty array so callers can render "no data".
                return cached != null ? cached.body : objectMapper.createArrayNode();
            }
            cache.put(key, new CacheEntry(fresh, Instant.now().plus(TTL)));
            return fresh;
        } catch (Exception e) {
            log.warn("Failed to fetch {}: {}", url, e.getMessage());
            return cached != null ? cached.body : objectMapper.createArrayNode();
        }
    }

    /**
     * Callers pass a base symbol ("BTC", "ETH", "SOL"). We normalise to a Binance
     * pair by appending "USDT" unless the caller already sent a full pair.
     */
    private static String normalizeToPair(String s) {
        String upper = s.toUpperCase();
        List<String> quotes = List.of("USDT", "BUSD", "USDC", "BTC", "ETH");
        for (String q : quotes) {
            if (upper.endsWith(q) && !upper.equals(q)) return upper;
        }
        return upper + "USDT";
    }

    private record CacheEntry(JsonNode body, Instant expiresAt) {
        boolean expired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}
