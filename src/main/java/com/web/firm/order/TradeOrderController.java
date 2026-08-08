package com.web.firm.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class TradeOrderController {

    private final TradeOrderService service;

    @GetMapping
    public ResponseEntity<List<TradeOrderDto>> mine(@RequestParam(required = false) String symbol) {
        List<TradeOrder> rows = symbol != null && !symbol.isBlank()
                ? service.listOpenForSymbol(symbol)
                : service.listMine();
        return ResponseEntity.ok(rows.stream().map(TradeOrderDto::fromEntity).toList());
    }

    @PostMapping
    public ResponseEntity<TradeOrderDto> place(@Valid @RequestBody PlaceBody body) {
        TradeOrder o = service.place(
                body.getSymbol(), body.getSide(), body.getType(),
                body.getAmount(), body.getPrice(), body.getStopPrice(),
                body.getDuration());
        return ResponseEntity.ok(TradeOrderDto.fromEntity(o));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<TradeOrderDto> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(TradeOrderDto.fromEntity(service.cancel(id)));
    }

    @Data
    public static class PlaceBody {
        @NotBlank
        private String symbol;
        @NotNull
        private OrderSide side;
        @NotNull
        private OrderType type;
        @NotNull
        private BigDecimal amount;
        private BigDecimal price;
        private BigDecimal stopPrice;
        private String duration;
    }
}
