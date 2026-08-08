package com.web.firm.crypto;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
 * Public crypto endpoints. Prices are served from the DB (populated by
 * {@link CryptoPriceScheduler} every 20 minutes) — no upstream call on the
 * hot path. Klines still proxy to Binance since candles change every second
 * and would be too heavy to cache in the DB; a 20-second in-memory cache
 * keeps polling cheap.
 */
@Slf4j
@RestController
@RequestMapping("/crypto")
@RequiredArgsConstructor
public class CryptoController {

    private static final Duration KLINES_TTL = Duration.ofSeconds(20);

    @Value("${crypto.klines-api:https://api.binance.com/api/v3/klines}")
    private String klinesUrl;

    private final CryptoAssetRepository cryptoRepository;
    private final ObjectMapper objectMapper;
    private final WebClient webClient = WebClient.builder().build();
    private final Map<String, CacheEntry> klinesCache = new ConcurrentHashMap<>();

    @GetMapping("/prices")
    public ResponseEntity<List<CryptoAssetDto>> prices() {
        List<CryptoAssetDto> rows = cryptoRepository.findByListedTrueOrderBySortOrderAscIdAsc().stream()
                .map(CryptoAssetDto::fromEntity)
                .toList();
        return ResponseEntity.ok(rows);
    }

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
        CacheEntry cached = klinesCache.get(key);
        if (cached != null && !cached.expired()) return cached.body;
        try {
            JsonNode fresh = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .onErrorResume(e -> {
                        log.warn("Klines fetch failed for {}: {}", url, e.getMessage());
                        return Mono.empty();
                    })
                    .block(Duration.ofSeconds(10));
            if (fresh == null) return cached != null ? cached.body : objectMapper.createArrayNode();
            klinesCache.put(key, new CacheEntry(fresh, Instant.now().plus(KLINES_TTL)));
            return fresh;
        } catch (Exception e) {
            log.warn("Failed to fetch {}: {}", url, e.getMessage());
            return cached != null ? cached.body : objectMapper.createArrayNode();
        }
    }

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
