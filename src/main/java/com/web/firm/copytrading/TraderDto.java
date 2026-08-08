package com.web.firm.copytrading;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraderDto {
    private Long id;
    private String name;
    private String username;
    private String avatarUrl;
    private Integer winRate;
    private Integer totalTrades;
    private Integer wins;
    private Integer losses;
    private Integer followers;
    private BigDecimal totalProfit;
    private BigDecimal minEntry;
    private String bio;
    private boolean published;
    private Integer sortOrder;

    public static TraderDto fromEntity(Trader t) {
        return TraderDto.builder()
                .id(t.getId())
                .name(t.getName())
                .username(t.getUsername())
                .avatarUrl(t.getAvatarUrl())
                .winRate(t.getWinRate())
                .totalTrades(t.getTotalTrades())
                .wins(t.getWins())
                .losses(t.getLosses())
                .followers(t.getFollowers())
                .totalProfit(t.getTotalProfit())
                .minEntry(t.getMinEntry())
                .bio(t.getBio())
                .published(t.isPublished())
                .sortOrder(t.getSortOrder())
                .build();
    }
}
