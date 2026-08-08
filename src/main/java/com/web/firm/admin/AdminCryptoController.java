package com.web.firm.admin;

import com.web.firm.crypto.CryptoAsset;
import com.web.firm.crypto.CryptoAssetDto;
import com.web.firm.crypto.CryptoAssetRepository;
import com.web.firm.crypto.CryptoPriceScheduler;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/crypto")
@RequiredArgsConstructor
public class AdminCryptoController {

    private final CryptoAssetRepository repository;
    private final CryptoPriceScheduler scheduler;

    @GetMapping
    public ResponseEntity<List<CryptoAssetDto>> list() {
        return ResponseEntity.ok(repository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(CryptoAssetDto::fromEntity).toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CryptoAssetDto> create(@RequestBody UpsertBody body) {
        CryptoAsset a = new CryptoAsset();
        applyBody(a, body);
        // Manual entries get a synthetic external_id so the scheduler's
        // upsert-by-external-id won't try to overwrite them.
        if (a.getExternalId() == null) {
            a.setExternalId(-Math.abs((long) (a.getSymbol() == null ? 0 : a.getSymbol().hashCode())));
        }
        return ResponseEntity.ok(CryptoAssetDto.fromEntity(repository.save(a)));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<CryptoAssetDto> update(@PathVariable Long id, @RequestBody UpsertBody body) {
        CryptoAsset a = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Crypto asset not found"));
        applyBody(a, body);
        return ResponseEntity.ok(CryptoAssetDto.fromEntity(repository.save(a)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Force an immediate scheduler run — surfaces per-run counts + error message. */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh() {
        CryptoPriceScheduler.RefreshReport r = scheduler.refresh();
        return ResponseEntity.ok(Map.of(
                "message", r.message(),
                "inserted", r.inserted(),
                "updated", r.updated(),
                "skipped", r.skipped()
        ));
    }

    private static void applyBody(CryptoAsset a, UpsertBody b) {
        if (b.getName() != null) a.setName(b.getName());
        if (b.getSymbol() != null) a.setSymbol(b.getSymbol().toUpperCase());
        if (b.getNetwork() != null) a.setNetwork(b.getNetwork());
        if (b.getLogoUrl() != null) a.setLogoUrl(b.getLogoUrl());
        if (b.getListed() != null) a.setListed(b.getListed());
        if (b.getSortOrder() != null) a.setSortOrder(b.getSortOrder());
        if (b.getCurrentPrice() != null) a.setCurrentPrice(b.getCurrentPrice());
        if (b.getPercentChange24h() != null) a.setPercentChange24h(b.getPercentChange24h());
        if (b.getMarketCap() != null) a.setMarketCap(b.getMarketCap());
        if (b.getVolume24h() != null) a.setVolume24h(b.getVolume24h());
        if (b.getVolumeChange24h() != null) a.setVolumeChange24h(b.getVolumeChange24h());
        if (b.getPercentChange30d() != null) a.setPercentChange30d(b.getPercentChange30d());
    }

    @Data
    public static class UpsertBody {
        private String name;
        private String symbol;
        private String network;
        private String logoUrl;
        private Boolean listed;
        private Integer sortOrder;
        private BigDecimal currentPrice;
        private BigDecimal percentChange24h;
        private BigDecimal marketCap;
        private BigDecimal volume24h;
        private BigDecimal volumeChange24h;
        private BigDecimal percentChange30d;
    }
}
