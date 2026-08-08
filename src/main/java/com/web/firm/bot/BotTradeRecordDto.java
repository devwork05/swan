package com.web.firm.bot;

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
public class BotTradeRecordDto {
    private Long id;
    private Long allocationId;
    private Long botId;
    private String botName;
    private String pair;
    private BotTradeRecord.Direction direction;
    private BotTradeRecord.Result result;
    private BigDecimal profit;
    private BigDecimal amount;
    private Instant tradedAt;

    public static BotTradeRecordDto fromEntity(BotTradeRecord r) {
        return BotTradeRecordDto.builder()
                .id(r.getId())
                .allocationId(r.getAllocation().getId())
                .botId(r.getAllocation().getBot().getId())
                .botName(r.getAllocation().getBot().getName())
                .pair(r.getPair())
                .direction(r.getDirection())
                .result(r.getResult())
                .profit(r.getProfit())
                .amount(r.getAmount())
                .tradedAt(r.getTradedAt())
                .build();
    }
}
