package com.web.firm.order;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/** A user-submitted order on any tradable symbol (crypto pair or stock ticker). */
@Entity
@Table(name = "trade_orders", indexes = {
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_status", columnList = "status"),
        @Index(name = "idx_order_symbol", columnList = "symbol")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** e.g. "BTC/USDT", "AAPL". Free-form on purpose so we support both crypto & stocks. */
    @Column(nullable = false, length = 32)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private OrderSide side;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OrderType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @ColumnDefault("'OPEN'")
    @Builder.Default
    private OrderStatus status = OrderStatus.OPEN;

    /** Amount of the base asset (e.g. 0.05 BTC). */
    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal amount;

    /** For LIMIT / STOP_LIMIT — quote-currency limit price. For MARKET fills, mirror-fill price. */
    @Column(precision = 24, scale = 8)
    private BigDecimal price;

    /** STOP_LIMIT trigger. */
    @Column(precision = 24, scale = 8)
    private BigDecimal stopPrice;

    /** "Good Till Cancelled", "1 Day", "1 Week", "1 Month". Free-form label. */
    @Column(length = 40)
    private String duration;

    /** Optional admin-authored note visible on the order. */
    @Column(length = 500)
    private String adminNotes;

    @Column
    private Instant filledAt;

    @Column
    private Instant cancelledAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
