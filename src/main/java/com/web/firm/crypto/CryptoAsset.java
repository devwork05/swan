package com.web.firm.crypto;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Denormalized crypto asset + current price row. Populated by
 * {@link CryptoPriceScheduler} every 20 minutes from the upstream feed
 * configured via {@code CRYPTO_PRICE_API}. Admins can also hand-edit any
 * field through {@code /admin/crypto} — the next scheduler run will overwrite
 * price fields, but static fields (name, symbol, logo, sortOrder, isListed)
 * are preserved because the scheduler only updates price columns.
 */
@Entity
@Table(name = "crypto_assets", indexes = {
        @Index(name = "idx_crypto_symbol", columnList = "symbol", unique = true),
        @Index(name = "idx_crypto_external", columnList = "external_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID from the upstream feed — used for upsert dedupe. */
    @Column(name = "external_id", nullable = false)
    private Long externalId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(length = 60)
    private String network;

    @Column(length = 500)
    private String logoUrl;

    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean listed = true;

    /** Ascending display order on the market list. Lower = higher up. */
    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer sortOrder = 0;

    /* ---------- price fields (refreshed by scheduler) ---------- */

    @Column(precision = 24, scale = 8)
    private BigDecimal currentPrice;

    @Column(precision = 10, scale = 4)
    private BigDecimal percentChange24h;

    @Column(precision = 24, scale = 2)
    private BigDecimal marketCap;

    @Column(precision = 24, scale = 2)
    private BigDecimal volume24h;

    @Column(precision = 10, scale = 4)
    private BigDecimal volumeChange24h;

    @Column(precision = 10, scale = 4)
    private BigDecimal percentChange30d;

    /** When the scheduler last refreshed price columns for this row. */
    @Column
    private Instant priceRefreshedAt;

    @Column
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
