package com.web.firm.bot;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/** A single trade a bot performed on behalf of an allocation. Admin can post these. */
@Entity
@Table(name = "bot_trade_records", indexes = {
        @Index(name = "idx_bot_trade_alloc", columnList = "allocation_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotTradeRecord {

    public enum Direction { RISE, FALL }
    public enum Result { WIN, LOSS }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "allocation_id")
    private BotAllocation allocation;

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

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Instant tradedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
