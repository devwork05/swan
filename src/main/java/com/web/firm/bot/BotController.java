package com.web.firm.bot;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class BotController {

    private final BotTradingService service;

    /** Public — list published bots. */
    @GetMapping("/bots")
    public ResponseEntity<List<TradingBotDto>> list() {
        return ResponseEntity.ok(service.listPublicBots().stream().map(TradingBotDto::fromEntity).toList());
    }

    /* ---------- user allocations ---------- */

    @GetMapping("/bot-trading/allocations")
    public ResponseEntity<List<BotAllocationDto>> mine() {
        return ResponseEntity.ok(service.listMyAllocations().stream().map(BotAllocationDto::fromEntity).toList());
    }

    @GetMapping("/bot-trading/history")
    public ResponseEntity<List<BotTradeRecordDto>> history() {
        return ResponseEntity.ok(service.listMyHistory().stream().map(BotTradeRecordDto::fromEntity).toList());
    }

    @PostMapping("/bot-trading/start")
    public ResponseEntity<BotAllocationDto> start(@RequestBody StartBody body) {
        return ResponseEntity.ok(BotAllocationDto.fromEntity(
                service.start(body.getBotId(), body.getAmount(), body.getPair())));
    }

    @PostMapping("/bot-trading/{allocationId}/stop")
    public ResponseEntity<BotAllocationDto> stop(@PathVariable Long allocationId) {
        return ResponseEntity.ok(BotAllocationDto.fromEntity(service.stop(allocationId)));
    }

    @Data
    public static class StartBody {
        private Long botId;
        private BigDecimal amount;
        private String pair;
    }
}
