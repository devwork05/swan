package com.web.firm.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryDto {

    private BigDecimal balance;
    private BigDecimal bonus;
    private BigDecimal referralBonus;
    private BigDecimal lockedBalance;
    private BigDecimal totalDeposited;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalProfit;

    public static WalletSummaryDto fromEntity(Wallet wallet) {
        return WalletSummaryDto.builder()
                .balance(wallet.getBalance())
                .bonus(wallet.getBonus())
                .referralBonus(wallet.getReferralBonus())
                .lockedBalance(wallet.getLockedBalance())
                .totalDeposited(wallet.getTotalDeposited())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .totalProfit(wallet.getTotalProfit())
                .build();
    }
}
