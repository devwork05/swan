package com.web.firm.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletDto {

    private Long id;
    private BigDecimal balance;
    private BigDecimal bonus;
    private BigDecimal referralBonus;
    private BigDecimal lockedBalance;
    private BigDecimal totalDeposited;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalProfit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WalletDto fromEntity(Wallet wallet) {
        return WalletDto.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .bonus(wallet.getBonus())
                .referralBonus(wallet.getReferralBonus())
                .lockedBalance(wallet.getLockedBalance())
                .totalDeposited(wallet.getTotalDeposited())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .totalProfit(wallet.getTotalProfit())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
