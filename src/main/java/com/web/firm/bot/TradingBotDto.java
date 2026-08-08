package com.web.firm.bot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradingBotDto {
    private Long id;
    private String name;
    private String strategy;
    private String description;
    private Integer winRate;
    private BigDecimal minInvestment;
    private BigDecimal performance30d;
    /** Front-end wants an array — we split the CSV column. */
    private List<String> pairs;
    private List<Integer> spark;
    private boolean published;
    private Integer sortOrder;

    public static TradingBotDto fromEntity(TradingBot b) {
        List<String> pairs = b.getPairs() == null || b.getPairs().isBlank()
                ? List.of()
                : java.util.Arrays.stream(b.getPairs().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList();
        List<Integer> spark = b.getSpark() == null || b.getSpark().isBlank()
                ? List.of()
                : java.util.Arrays.stream(b.getSpark().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> {
                            try { return Integer.parseInt(s); }
                            catch (NumberFormatException e) { return null; }
                        })
                        .filter(java.util.Objects::nonNull)
                        .toList();
        return TradingBotDto.builder()
                .id(b.getId())
                .name(b.getName())
                .strategy(b.getStrategy())
                .description(b.getDescription())
                .winRate(b.getWinRate())
                .minInvestment(b.getMinInvestment())
                .performance30d(b.getPerformance30d())
                .pairs(pairs)
                .spark(spark)
                .published(b.isPublished())
                .sortOrder(b.getSortOrder())
                .build();
    }
}
