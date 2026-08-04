package com.web.firm.plan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentPlanDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal minReturn;
    private BigDecimal maxReturn;
    private String duration;
    private String incrementInterval;
    private String incrementType;
    private String incrementAmount;
    private BigDecimal bonus;
    private BigDecimal referralBonus;
    private boolean returnCapital;
    private boolean active;

    public static InvestmentPlanDto fromEntity(InvestmentPlan plan) {
        return InvestmentPlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .minAmount(plan.getMinAmount())
                .maxAmount(plan.getMaxAmount())
                .minReturn(plan.getMinReturn())
                .maxReturn(plan.getMaxReturn())
                .duration(plan.getDuration())
                .incrementInterval(plan.getIncrementInterval())
                .incrementType(plan.getIncrementType().name())
                .incrementAmount(plan.getIncrementAmount())
                .bonus(plan.getBonus())
                .referralBonus(plan.getReferralBonus())
                .returnCapital(plan.isReturnCapital())
                .active(plan.isActive())
                .build();
    }
}
