package com.web.firm.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdjustBalanceRequest {

    /** BALANCE | BONUS | REFERRAL_BONUS | PROFIT */
    @NotNull
    private String field;

    /** Positive to credit, negative to debit. */
    @NotNull
    private BigDecimal amount;

    private String reason;
}
