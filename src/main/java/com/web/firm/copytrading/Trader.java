package com.web.firm.copytrading;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A public "trader" surfaced on the copy-trading page. Everything is admin-managed. */
@Entity
@Table(name = "traders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 60)
    private String username;

    @Column(length = 500)
    private String avatarUrl;

    /** 0-100. */
    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer winRate = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer totalTrades = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer wins = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer losses = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer followers = 0;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal totalProfit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("50")
    @Builder.Default
    private BigDecimal minEntry = new BigDecimal("50");

    @Column(length = 500)
    private String bio;

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
