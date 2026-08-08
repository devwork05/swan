package com.web.firm.copytrading;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraderTradeDto {
    private Long id;
    private Long traderId;
    private String pair;
    private TraderTrade.Direction direction;
    private TraderTrade.Result result;
    private BigDecimal profit;
    private Instant tradedAt;

    public static TraderTradeDto fromEntity(TraderTrade t) {
        return TraderTradeDto.builder()
                .id(t.getId())
                .traderId(t.getTrader().getId())
                .pair(t.getPair())
                .direction(t.getDirection())
                .result(t.getResult())
                .profit(t.getProfit())
                .tradedAt(t.getTradedAt())
                .build();
    }
}
