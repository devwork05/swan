package com.web.firm.bot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BotAllocationDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long botId;
    private String botName;
    private BigDecimal amount;
    private String pair;
    private BotAllocation.Status status;
    private BigDecimal seedPnl;
    private Instant stoppedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BotAllocationDto fromEntity(BotAllocation a) {
        return BotAllocationDto.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .userName(a.getUser().getFullName())
                .userEmail(a.getUser().getEmail())
                .botId(a.getBot().getId())
                .botName(a.getBot().getName())
                .amount(a.getAmount())
                .pair(a.getPair())
                .status(a.getStatus())
                .seedPnl(a.getSeedPnl())
                .stoppedAt(a.getStoppedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
