package com.web.firm.order;

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
public class TradeOrderDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String symbol;
    private OrderSide side;
    private OrderType type;
    private OrderStatus status;
    private BigDecimal amount;
    private BigDecimal price;
    private BigDecimal stopPrice;
    private String duration;
    private String adminNotes;
    private Instant filledAt;
    private Instant cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TradeOrderDto fromEntity(TradeOrder o) {
        return TradeOrderDto.builder()
                .id(o.getId())
                .userId(o.getUser().getId())
                .userName(o.getUser().getFullName())
                .userEmail(o.getUser().getEmail())
                .symbol(o.getSymbol())
                .side(o.getSide())
                .type(o.getType())
                .status(o.getStatus())
                .amount(o.getAmount())
                .price(o.getPrice())
                .stopPrice(o.getStopPrice())
                .duration(o.getDuration())
                .adminNotes(o.getAdminNotes())
                .filledAt(o.getFilledAt())
                .cancelledAt(o.getCancelledAt())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
