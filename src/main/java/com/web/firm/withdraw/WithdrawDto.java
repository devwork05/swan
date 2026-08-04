package com.web.firm.withdraw;

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
public class WithdrawDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String methodSymbol;
    private String methodName;
    private BigDecimal amount;
    private String walletAddress;
    private String status;
    private String trxid;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WithdrawDto fromEntity(Withdraw w) {
        return WithdrawDto.builder()
                .id(w.getId())
                .userId(w.getUser().getId())
                .userEmail(w.getUser().getEmail())
                .userFullName(w.getUser().getFullName())
                .methodSymbol(w.getMethod().getSymbol())
                .methodName(w.getMethod().getName())
                .amount(w.getAmount())
                .walletAddress(w.getWalletAddress())
                .status(w.getStatus().name())
                .trxid(w.getTrxid())
                .rejectionReason(w.getRejectionReason())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
