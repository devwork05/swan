package com.web.firm.copytrading;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A user's active copy-trading subscription to a trader. One row per
 * (user, trader) pair — enforced by a unique constraint.
 */
@Entity
@Table(name = "copy_follows", uniqueConstraints = {
        @UniqueConstraint(name = "uq_copy_follow_user_trader", columnNames = {"user_id", "trader_id"})
}, indexes = {
        @Index(name = "idx_copy_follow_user", columnList = "user_id"),
        @Index(name = "idx_copy_follow_trader", columnList = "trader_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopyFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "trader_id")
    private Trader trader;

    @Column(nullable = false)
    @ColumnDefault("25")
    @Builder.Default
    private Integer copyPercent = 25;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("250")
    @Builder.Default
    private BigDecimal maxPerTrade = new BigDecimal("250");

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("1500")
    @Builder.Default
    private BigDecimal dailyLimit = new BigDecimal("1500");

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal fundedAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
