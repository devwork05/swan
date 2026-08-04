package com.web.firm.plan;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "investment_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestmentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Display price / face value for the plan (headline number shown on cards). */
    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    /** Minimum investment a user may put into this plan. */
    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    private BigDecimal minAmount;

    /** Maximum investment a user may put into this plan. */
    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    private BigDecimal maxAmount;

    /** ROI range shown to users (informational — actual accrual is driven by incrementAmount). */
    @Column(nullable = false, precision = 5, scale = 2)
    @ColumnDefault("0")
    private BigDecimal minReturn;

    @Column(nullable = false, precision = 5, scale = 2)
    @ColumnDefault("0")
    private BigDecimal maxReturn;

    /**
     * Human duration string, e.g. "1 Day", "3 Weeks", "6 Months", "1 Year", "48 Hours".
     * Parsed by {@link DurationParser}.
     */
    @Column(nullable = false)
    @ColumnDefault("'1 Day'")
    private String duration;

    /**
     * Preset interval label, e.g. "Hourly", "Every 6 Hours", "Twice Daily", "Daily",
     * "Weekly", "Monthly", "Yearly", etc. Parsed by {@link IntervalParser} into a
     * concrete {@link java.time.Duration}.
     */
    @Column(nullable = false)
    @ColumnDefault("'Daily'")
    private String incrementInterval;

    /** Whether incrementAmount values are percentages or fixed dollar amounts. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'PERCENTAGE'")
    @Builder.Default
    private IncrementType incrementType = IncrementType.PERCENTAGE;

    /**
     * Comma-separated payout values used per tick. E.g. "2.1, 4, 5.2, 7.3".
     * The scheduler randomly picks one at every accrual tick.
     * Interpreted as percent of principal (PERCENTAGE) or a flat dollar amount (FIXED).
     */
    @Column(nullable = false)
    @ColumnDefault("'1'")
    @Builder.Default
    private String incrementAmount = "1";

    /** One-time bonus credited on investment. */
    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal bonus = BigDecimal.ZERO;

    /** One-time referral bonus paid to the referrer when this plan is bought. */
    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal referralBonus = BigDecimal.ZERO;

    /** Whether principal is returned when the plan matures. */
    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean returnCapital = true;

    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean active = true;
}
