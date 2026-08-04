package com.web.firm.deposit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "deposit_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'CRYPTO'")
    @Builder.Default
    private GatewayCategory category = GatewayCategory.CRYPTO;

    /** Optional network label (TRC20, ERC20, BEP20…). */
    @Column
    private String network;

    /** For crypto: deposit wallet address. Users send funds here. */
    @Column
    private String address;

    /** URL to a logo image shown on the picker. */
    @Column
    private String logoUrl;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal minAmount;

    @Column(precision = 19, scale = 2)
    private BigDecimal maxAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal feePercent = BigDecimal.ZERO;

    @Column(nullable = false)
    @ColumnDefault("'Instant'")
    @Builder.Default
    private String processingTime = "Instant";

    /** Bank-specific fields (nullable when category == CRYPTO). */
    @Column
    private String bankName;

    @Column
    private String accountName;

    @Column
    private String accountNumber;

    @Column
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Whether users see this method in the picker. */
    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean listed = true;
}
