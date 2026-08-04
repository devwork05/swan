package com.web.firm.deposit;

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
public class DepositDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String methodSymbol;
    private String methodName;
    private BigDecimal amount;
    private String status;
    private String trxid;
    private String trxHash;
    private String proofFileName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DepositDto fromEntity(Deposit d) {
        return DepositDto.builder()
                .id(d.getId())
                .userId(d.getUser().getId())
                .userEmail(d.getUser().getEmail())
                .userFullName(d.getUser().getFullName())
                .methodSymbol(d.getDepositMethod().getSymbol())
                .methodName(d.getDepositMethod().getName())
                .amount(d.getAmount())
                .status(d.getStatus().name())
                .trxid(d.getTrxid())
                .trxHash(d.getTrxHash())
                .proofFileName(d.getProofFileName())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
