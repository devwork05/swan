package com.web.firm.copytrading;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/** A completed trade on a trader's log — displayed on their profile. Admin-managed. */
@Entity
@Table(name = "trader_trades", indexes = {
        @Index(name = "idx_trader_trade_trader", columnList = "trader_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraderTrade {

    public enum Direction { RISE, FALL }
    public enum Result { WIN, LOSS }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trader_id")
    private Trader trader;

    @Column(nullable = false, length = 32)
    private String pair;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Direction direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Result result;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal profit;

    @Column(nullable = false)
    private Instant tradedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
