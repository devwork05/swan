package com.web.firm.plan;

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
public class UserPlanDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private Long planId;
    private String planName;
    private BigDecimal minReturn;
    private BigDecimal maxReturn;
    private String duration;
    private String incrementInterval;
    private String incrementType;
    private boolean returnCapital;
    private BigDecimal amount;
    private BigDecimal expectedReturn;
    private BigDecimal accruedProfit;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime endsAt;
    private LocalDateTime createdAt;

    public static UserPlanDto fromEntity(UserPlan up) {
        InvestmentPlan p = up.getInvestmentPlan();
        return UserPlanDto.builder()
                .id(up.getId())
                .userId(up.getUser().getId())
                .userEmail(up.getUser().getEmail())
                .userFullName(up.getUser().getFullName())
                .planId(p.getId())
                .planName(p.getName())
                .minReturn(p.getMinReturn())
                .maxReturn(p.getMaxReturn())
                .duration(p.getDuration())
                .incrementInterval(p.getIncrementInterval())
                .incrementType(p.getIncrementType().name())
                .returnCapital(p.isReturnCapital())
                .amount(up.getAmount())
                .expectedReturn(up.getExpectedReturn())
                .accruedProfit(up.getAccruedProfit())
                .status(up.getStatus().name())
                .startedAt(up.getStartedAt())
                .endsAt(up.getEndsAt())
                .createdAt(up.getCreatedAt())
                .build();
    }
}
