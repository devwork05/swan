package com.web.firm.admin;

import com.web.firm.copytrading.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminTraderController {

    private final TraderRepository traderRepository;
    private final TraderTradeRepository tradeRepository;
    private final CopyFollowRepository followRepository;
    private final CopyTradingService copyTradingService;

    /* ---------- traders ---------- */

    @GetMapping("/traders")
    public ResponseEntity<List<TraderDto>> listTraders() {
        return ResponseEntity.ok(traderRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(TraderDto::fromEntity).toList());
    }

    @PostMapping("/traders")
    @Transactional
    public ResponseEntity<TraderDto> createTrader(@RequestBody TraderBody b) {
        Trader t = new Trader();
        applyTrader(t, b);
        return ResponseEntity.ok(TraderDto.fromEntity(traderRepository.save(t)));
    }

    @PatchMapping("/traders/{id}")
    @Transactional
    public ResponseEntity<TraderDto> updateTrader(@PathVariable Long id, @RequestBody TraderBody b) {
        Trader t = traderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Trader not found"));
        applyTrader(t, b);
        return ResponseEntity.ok(TraderDto.fromEntity(traderRepository.save(t)));
    }

    @DeleteMapping("/traders/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrader(@PathVariable Long id) {
        traderRepository.findById(id).ifPresent(t -> {
            tradeRepository.deleteByTrader(t);
            followRepository.deleteByTrader(t);
            traderRepository.delete(t);
        });
        return ResponseEntity.noContent().build();
    }

    private static void applyTrader(Trader t, TraderBody b) {
        if (b.getName() != null) t.setName(b.getName());
        if (b.getUsername() != null) t.setUsername(b.getUsername());
        if (b.getAvatarUrl() != null) t.setAvatarUrl(b.getAvatarUrl());
        if (b.getWinRate() != null) t.setWinRate(b.getWinRate());
        if (b.getTotalTrades() != null) t.setTotalTrades(b.getTotalTrades());
        if (b.getWins() != null) t.setWins(b.getWins());
        if (b.getLosses() != null) t.setLosses(b.getLosses());
        if (b.getFollowers() != null) t.setFollowers(b.getFollowers());
        if (b.getTotalProfit() != null) t.setTotalProfit(b.getTotalProfit());
        if (b.getMinEntry() != null) t.setMinEntry(b.getMinEntry());
        if (b.getBio() != null) t.setBio(b.getBio());
        if (b.getPublished() != null) t.setPublished(b.getPublished());
        if (b.getSortOrder() != null) t.setSortOrder(b.getSortOrder());
    }

    /* ---------- trader trades ---------- */

    @GetMapping("/traders/{traderId}/trades")
    public ResponseEntity<List<TraderTradeDto>> listTrades(@PathVariable Long traderId) {
        Trader t = traderRepository.findById(traderId).orElseThrow(() -> new IllegalArgumentException("Trader not found"));
        return ResponseEntity.ok(tradeRepository.findByTraderOrderByTradedAtDesc(t).stream()
                .map(TraderTradeDto::fromEntity).toList());
    }

    @PostMapping("/traders/{traderId}/trades")
    @Transactional
    public ResponseEntity<TraderTradeDto> createTrade(@PathVariable Long traderId, @RequestBody TradeBody b) {
        Trader t = traderRepository.findById(traderId).orElseThrow(() -> new IllegalArgumentException("Trader not found"));

        // Normalize the profit to always be signed based on WIN/LOSS so the
        // stored value tells the whole story on read.
        int sign = b.getResult() == TraderTrade.Result.WIN ? 1 : -1;
        BigDecimal signedProfit = (b.getProfit() == null ? BigDecimal.ZERO : b.getProfit().abs())
                .multiply(BigDecimal.valueOf(sign));

        TraderTrade tr = TraderTrade.builder()
                .trader(t)
                .pair(b.getPair())
                .direction(b.getDirection())
                .result(b.getResult())
                .profit(signedProfit)
                .tradedAt(b.getTradedAt() != null ? b.getTradedAt() : Instant.now())
                .build();
        TraderTrade saved = tradeRepository.save(tr);

        // Update trader-level rollups so their profile stats stay in sync.
        t.setTotalTrades(t.getTotalTrades() + 1);
        if (b.getResult() == TraderTrade.Result.WIN) t.setWins(t.getWins() + 1);
        else t.setLosses(t.getLosses() + 1);
        int total = Math.max(1, t.getTotalTrades());
        t.setWinRate((int) Math.round((100.0 * t.getWins()) / total));
        t.setTotalProfit(t.getTotalProfit().add(signedProfit));
        traderRepository.save(t);

        // Fan out to every active follower's wallet + transaction log.
        copyTradingService.applyTraderTradeToFollowers(t, saved);

        return ResponseEntity.ok(TraderTradeDto.fromEntity(saved));
    }

    @DeleteMapping("/trader-trades/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrade(@PathVariable Long id) {
        tradeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ---------- follows (read-only for admin) ---------- */

    @GetMapping("/copy-follows")
    public ResponseEntity<List<CopyFollowDto>> listFollows() {
        return ResponseEntity.ok(followRepository.findAll().stream().map(CopyFollowDto::fromEntity).toList());
    }

    @DeleteMapping("/copy-follows/{id}")
    @Transactional
    public ResponseEntity<Void> deleteFollow(@PathVariable Long id) {
        followRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class TraderBody {
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
        private Boolean published;
        private Integer sortOrder;
    }

    @Data
    public static class TradeBody {
        private String pair;
        private TraderTrade.Direction direction;
        private TraderTrade.Result result;
        private BigDecimal profit;
        private Instant tradedAt;
    }
}
