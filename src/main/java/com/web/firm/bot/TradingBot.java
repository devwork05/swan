package com.web.firm.bot;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** An admin-curated automated-strategy bot users can allocate funds to. */
@Entity
@Table(name = "trading_bots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradingBot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    /** Short strategy label — e.g. "Trend-following". */
    @Column(length = 80)
    private String strategy;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** 0-100. */
    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer winRate = 0;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("100")
    @Builder.Default
    private BigDecimal minInvestment = new BigDecimal("100");

    /** Trailing-30-day performance % (signed). */
    @Column(nullable = false, precision = 10, scale = 4)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal performance30d = BigDecimal.ZERO;

    /** Comma-separated pair whitelist e.g. "BTC/USDT,ETH/USDT". */
    @Column(length = 500)
    private String pairs;

    /** Comma-separated sparkline values e.g. "100,102,104". */
    @Column(length = 1000)
    private String spark;

    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean published = true;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
