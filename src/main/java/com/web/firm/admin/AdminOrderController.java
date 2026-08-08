package com.web.firm.admin;

import com.web.firm.order.OrderStatus;
import com.web.firm.order.TradeOrderDto;
import com.web.firm.order.TradeOrderRepository;
import com.web.firm.order.TradeOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final TradeOrderRepository repository;
    private final TradeOrderService service;

    @GetMapping
    public ResponseEntity<List<TradeOrderDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        OrderStatus st = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            try {
                st = OrderStatus.valueOf(status);
            } catch (IllegalArgumentException ignored) {
                // fall through — no filter
            }
        }
        String q = search == null ? "" : search.trim();
        return ResponseEntity.ok(repository.search(q, st).stream().map(TradeOrderDto::fromEntity).toList());
    }

    @PostMapping("/{id}/fill")
    public ResponseEntity<TradeOrderDto> fill(@PathVariable Long id, @RequestBody(required = false) FillBody body) {
        BigDecimal price = body == null ? null : body.getFillPrice();
        return ResponseEntity.ok(TradeOrderDto.fromEntity(service.adminFill(id, price)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<TradeOrderDto> reject(@PathVariable Long id, @RequestBody(required = false) RejectBody body) {
        String reason = body == null ? null : body.getReason();
        return ResponseEntity.ok(TradeOrderDto.fromEntity(service.adminReject(id, reason)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TradeOrderDto> update(@PathVariable Long id, @RequestBody UpdateBody body) {
        return ResponseEntity.ok(TradeOrderDto.fromEntity(
                service.adminUpdate(id, body.getAdminNotes(), body.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.adminDelete(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class FillBody {
        private BigDecimal fillPrice;
    }

    @Data
    public static class RejectBody {
        private String reason;
    }

    @Data
    public static class UpdateBody {
        private String adminNotes;
        private OrderStatus status;
    }
}
