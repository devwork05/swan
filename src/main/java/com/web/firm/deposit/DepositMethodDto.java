package com.web.firm.deposit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositMethodDto {

    private Long id;
    private String name;
    private String symbol;
    private String category;
    private String network;
    private String address;
    private String logoUrl;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal feePercent;
    private String processingTime;
    private String bankName;
    private String accountName;
    private String accountNumber;
    private String code;
    private String description;
    private boolean listed;

    public static DepositMethodDto fromEntity(DepositMethod method) {
        return DepositMethodDto.builder()
                .id(method.getId())
                .name(method.getName())
                .symbol(method.getSymbol())
                .category(method.getCategory().name())
                .network(method.getNetwork())
                .address(method.getAddress())
                .logoUrl(method.getLogoUrl())
                .minAmount(method.getMinAmount())
                .maxAmount(method.getMaxAmount())
                .feePercent(method.getFeePercent())
                .processingTime(method.getProcessingTime())
                .bankName(method.getBankName())
                .accountName(method.getAccountName())
                .accountNumber(method.getAccountNumber())
                .code(method.getCode())
                .description(method.getDescription())
                .listed(method.isListed())
                .build();
    }
}
