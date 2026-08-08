package com.web.firm.copytrading;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TraderController {

    private final CopyTradingService service;
    private final TraderTradeRepository tradeRepository;

    /** Public — list published traders. */
    @GetMapping("/traders")
    public ResponseEntity<List<TraderDto>> list() {
        return ResponseEntity.ok(service.listPublic().stream().map(TraderDto::fromEntity).toList());
    }

    /** Public — a single trader plus their recent trades. */
    @GetMapping("/traders/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Trader t = service.mustFind(id);
        return ResponseEntity.ok(Map.of(
                "trader", TraderDto.fromEntity(t),
                "recentTrades", tradeRepository.findByTraderOrderByTradedAtDesc(t).stream()
                        .limit(20).map(TraderTradeDto::fromEntity).toList()
        ));
    }

    /* ---------- user-managed follows ---------- */

    @GetMapping("/copy-trading/follows")
    public ResponseEntity<List<CopyFollowDto>> myFollows() {
        return ResponseEntity.ok(service.listMyFollows().stream().map(CopyFollowDto::fromEntity).toList());
    }

    @PostMapping("/copy-trading/{traderId}/follow")
    public ResponseEntity<CopyFollowDto> follow(@PathVariable Long traderId, @RequestBody(required = false) FollowBody body) {
        Integer pct = body == null ? null : body.getCopyPercent();
        BigDecimal max = body == null ? null : body.getMaxPerTrade();
        BigDecimal daily = body == null ? null : body.getDailyLimit();
        return ResponseEntity.ok(CopyFollowDto.fromEntity(service.follow(traderId, pct, max, daily)));
    }

    @PatchMapping("/copy-trading/{traderId}")
    public ResponseEntity<CopyFollowDto> update(@PathVariable Long traderId, @RequestBody UpdateBody body) {
        return ResponseEntity.ok(CopyFollowDto.fromEntity(
                service.update(traderId, body.getCopyPercent(), body.getMaxPerTrade(), body.getDailyLimit(), body.getActive())));
    }

    @PostMapping("/copy-trading/{traderId}/fund")
    public ResponseEntity<CopyFollowDto> fund(@PathVariable Long traderId, @RequestBody FundBody body) {
        return ResponseEntity.ok(CopyFollowDto.fromEntity(service.fund(traderId, body.getAmount())));
    }

    @DeleteMapping("/copy-trading/{traderId}")
    public ResponseEntity<Void> unfollow(@PathVariable Long traderId) {
        service.unfollow(traderId);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class FollowBody {
        private Integer copyPercent;
        private BigDecimal maxPerTrade;
        private BigDecimal dailyLimit;
    }

    @Data
    public static class UpdateBody {
        private Integer copyPercent;
        private BigDecimal maxPerTrade;
        private BigDecimal dailyLimit;
        private Boolean active;
    }

    @Data
    public static class FundBody {
        private BigDecimal amount;
    }
}
