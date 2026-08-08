package com.web.firm.admin;

import com.web.firm.bot.*;
import com.web.firm.transaction.Transaction;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.transaction.TransactionStatus;
import com.web.firm.transaction.TransactionType;
import com.web.firm.wallet.WalletService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminBotController {

    private final TradingBotRepository botRepository;
    private final BotAllocationRepository allocationRepository;
    private final BotTradeRecordRepository tradeRepository;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    /* ---------- bots ---------- */

    @GetMapping("/bots")
    public ResponseEntity<List<TradingBotDto>> listBots() {
        return ResponseEntity.ok(botRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(TradingBotDto::fromEntity).toList());
    }

    @PostMapping("/bots")
    @Transactional
    public ResponseEntity<TradingBotDto> createBot(@RequestBody BotBody b) {
        TradingBot bot = new TradingBot();
        applyBot(bot, b);
        return ResponseEntity.ok(TradingBotDto.fromEntity(botRepository.save(bot)));
    }

    @PatchMapping("/bots/{id}")
    @Transactional
    public ResponseEntity<TradingBotDto> updateBot(@PathVariable Long id, @RequestBody BotBody b) {
        TradingBot bot = botRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Bot not found"));
        applyBot(bot, b);
        return ResponseEntity.ok(TradingBotDto.fromEntity(botRepository.save(bot)));
    }

    @DeleteMapping("/bots/{id}")
    @Transactional
    public ResponseEntity<Void> deleteBot(@PathVariable Long id) {
        botRepository.findById(id).ifPresent(bot -> {
            // Delete cascade: allocations → trade records first, then allocations, then bot.
            List<BotAllocation> allocs = allocationRepository.findByBotOrderByCreatedAtDesc(bot);
            for (BotAllocation a : allocs) tradeRepository.deleteByAllocation(a);
            allocationRepository.deleteByBot(bot);
            botRepository.delete(bot);
        });
        return ResponseEntity.noContent().build();
    }

    private static void applyBot(TradingBot bot, BotBody b) {
        if (b.getName() != null) bot.setName(b.getName());
        if (b.getStrategy() != null) bot.setStrategy(b.getStrategy());
        if (b.getDescription() != null) bot.setDescription(b.getDescription());
        if (b.getWinRate() != null) bot.setWinRate(b.getWinRate());
        if (b.getMinInvestment() != null) bot.setMinInvestment(b.getMinInvestment());
        if (b.getPerformance30d() != null) bot.setPerformance30d(b.getPerformance30d());
        if (b.getPairs() != null) bot.setPairs(String.join(",", b.getPairs()));
        if (b.getSpark() != null) bot.setSpark(b.getSpark().stream().map(String::valueOf).collect(Collectors.joining(",")));
        if (b.getPublished() != null) bot.setPublished(b.getPublished());
        if (b.getSortOrder() != null) bot.setSortOrder(b.getSortOrder());
    }

    /* ---------- allocations (read-only listing + delete) ---------- */

    @GetMapping("/bot-allocations")
    public ResponseEntity<List<BotAllocationDto>> listAllocations() {
        return ResponseEntity.ok(allocationRepository.findAll().stream()
                .map(BotAllocationDto::fromEntity).toList());
    }

    @DeleteMapping("/bot-allocations/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        allocationRepository.findById(id).ifPresent(a -> {
            tradeRepository.deleteByAllocation(a);
            allocationRepository.delete(a);
        });
        return ResponseEntity.noContent().build();
    }

    /* ---------- bot trade records ---------- */

    @GetMapping("/bot-allocations/{allocationId}/trades")
    public ResponseEntity<List<BotTradeRecordDto>> listTrades(@PathVariable Long allocationId) {
        BotAllocation a = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));
        return ResponseEntity.ok(tradeRepository.findByAllocationOrderByTradedAtDesc(a).stream()
                .map(BotTradeRecordDto::fromEntity).toList());
    }

    @PostMapping("/bot-allocations/{allocationId}/trades")
    @Transactional
    public ResponseEntity<BotTradeRecordDto> createTrade(@PathVariable Long allocationId, @RequestBody TradeBody b) {
        BotAllocation a = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        // Normalize the signed profit from the admin's WIN/LOSS choice.
        BigDecimal magnitude = b.getProfit() == null ? BigDecimal.ZERO : b.getProfit().abs();
        int sign = b.getResult() == BotTradeRecord.Result.WIN ? 1 : -1;
        BigDecimal signed = magnitude.multiply(BigDecimal.valueOf(sign));

        BotTradeRecord tr = BotTradeRecord.builder()
                .allocation(a)
                .pair(b.getPair() != null ? b.getPair() : a.getPair())
                .direction(b.getDirection())
                .result(b.getResult())
                .profit(signed)
                .amount(b.getAmount() != null ? b.getAmount() : a.getAmount())
                .tradedAt(b.getTradedAt() != null ? b.getTradedAt() : Instant.now())
                .build();
        BotTradeRecord saved = tradeRepository.save(tr);

        // Roll into the allocation's running PnL and credit/debit the owner's wallet.
        a.setSeedPnl(a.getSeedPnl().add(signed));
        allocationRepository.save(a);

        if (sign > 0) {
            walletService.applyProfit(a.getUser(), signed);
        } else {
            walletService.adjustBalance(a.getUser(), signed, WalletService.AdjustmentField.BALANCE);
        }

        transactionRepository.save(Transaction.builder()
                .user(a.getUser())
                .type(TransactionType.BOT_TRADING)
                .amount(signed)
                .status(TransactionStatus.COMPLETED)
                .description(String.format("Bot trade — %s %s %s %s%.2f",
                        a.getBot().getName(), tr.getPair(), tr.getResult(),
                        sign > 0 ? "+" : "", signed.doubleValue()))
                .build());

        return ResponseEntity.ok(BotTradeRecordDto.fromEntity(saved));
    }

    @DeleteMapping("/bot-trades/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrade(@PathVariable Long id) {
        tradeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class BotBody {
        private String name;
        private String strategy;
        private String description;
        private Integer winRate;
        private BigDecimal minInvestment;
        private BigDecimal performance30d;
        private List<String> pairs;
        private List<Integer> spark;
        private Boolean published;
        private Integer sortOrder;
    }

    @Data
    public static class TradeBody {
        private String pair;
        private BotTradeRecord.Direction direction;
        private BotTradeRecord.Result result;
        private BigDecimal profit;
        private BigDecimal amount;
        private Instant tradedAt;
    }
}
