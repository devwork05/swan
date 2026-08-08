package com.web.firm.copytrading;

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
public class CopyFollowDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long traderId;
    private String traderName;
    private String traderUsername;
    private Integer copyPercent;
    private BigDecimal maxPerTrade;
    private BigDecimal dailyLimit;
    private BigDecimal fundedAmount;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CopyFollowDto fromEntity(CopyFollow f) {
        return CopyFollowDto.builder()
                .id(f.getId())
                .userId(f.getUser().getId())
                .userName(f.getUser().getFullName())
                .userEmail(f.getUser().getEmail())
                .traderId(f.getTrader().getId())
                .traderName(f.getTrader().getName())
                .traderUsername(f.getTrader().getUsername())
                .copyPercent(f.getCopyPercent())
                .maxPerTrade(f.getMaxPerTrade())
                .dailyLimit(f.getDailyLimit())
                .fundedAmount(f.getFundedAmount())
                .active(f.isActive())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
