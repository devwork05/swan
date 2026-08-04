package com.web.firm.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {

    private long totalUsers;
    private long pendingDeposits;
    private long pendingWithdrawals;
    private long activePlans;
    private BigDecimal totalDeposited;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalBalance;
    private BigDecimal totalProfit;
}
