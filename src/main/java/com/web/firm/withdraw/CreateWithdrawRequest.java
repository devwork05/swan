package com.web.firm.withdraw;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateWithdrawRequest {

    @NotNull
    private Long methodId;

    @NotNull
    @Min(1)
    private BigDecimal amount;

    @NotBlank
    private String walletAddress;
}
