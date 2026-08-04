package com.web.firm.plan;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvestRequest {

    @NotNull
    @Min(1)
    private BigDecimal amount;
}
