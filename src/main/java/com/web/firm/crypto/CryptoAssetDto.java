package com.web.firm.crypto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Shape matches what the marketing frontend already expects — flat asset
 * fields plus a nested `price` object — so the existing UI code doesn't
 * have to change when we swap the live-proxy for DB-backed data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CryptoAssetDto {
    private Long id;
    private String name;
    private String symbol;
    private String network;

    /** Kept for backwards-compat with the pre-DB feed shape. Frontend reads this. */
    @Builder.Default
    private Integer is_listed = 1;

    private String logo_url;
    private Integer sortOrder;

    private PriceBlock price;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceBlock {
        private BigDecimal current_price;
        private BigDecimal percent_change_24h;
        private BigDecimal market_cap;
        private BigDecimal volume_24h;
        private BigDecimal volume_change_24h;
        private BigDecimal percent_change_30d;
        private Instant updated_at;
    }

    public static CryptoAssetDto fromEntity(CryptoAsset a) {
        PriceBlock price = null;
        if (a.getCurrentPrice() != null) {
            price = PriceBlock.builder()
                    .current_price(a.getCurrentPrice())
                    .percent_change_24h(a.getPercentChange24h())
                    .market_cap(a.getMarketCap())
                    .volume_24h(a.getVolume24h())
                    .volume_change_24h(a.getVolumeChange24h())
                    .percent_change_30d(a.getPercentChange30d())
                    .updated_at(a.getPriceRefreshedAt())
                    .build();
        }
        return CryptoAssetDto.builder()
                .id(a.getId())
                .name(a.getName())
                .symbol(a.getSymbol())
                .network(a.getNetwork())
                .is_listed(a.isListed() ? 1 : 0)
                .logo_url(a.getLogoUrl())
                .sortOrder(a.getSortOrder())
                .price(price)
                .build();
    }
}
