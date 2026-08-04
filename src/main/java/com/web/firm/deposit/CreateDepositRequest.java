package com.web.firm.deposit;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateDepositRequest {

    @NotNull
    private Long depositMethodId;

    @NotNull
    @Min(1)
    private BigDecimal amount;

    /** Optional user-provided transaction hash from the blockchain. */
    private String trxHash;

    /** Cloudinary URL (or any URL) to the uploaded payment proof screenshot. */
    private String proofUrl;
}
