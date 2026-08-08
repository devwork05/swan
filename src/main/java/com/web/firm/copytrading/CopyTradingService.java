package com.web.firm.copytrading;

import com.web.firm.transaction.Transaction;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.transaction.TransactionStatus;
import com.web.firm.transaction.TransactionType;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import com.web.firm.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CopyTradingService {

    private final TraderRepository traderRepository;
    private final CopyFollowRepository followRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public List<Trader> listPublic() {
        return traderRepository.findByPublishedTrueOrderBySortOrderAscIdAsc();
    }

    public Trader mustFind(Long id) {
        return traderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trader not found"));
    }

    public List<CopyFollow> listMyFollows() {
        return followRepository.findByUserOrderByCreatedAtDesc(currentUser());
    }

    @Transactional
    public CopyFollow follow(Long traderId, Integer copyPercent, BigDecimal maxPerTrade, BigDecimal dailyLimit) {
        User user = currentUser();
        Trader trader = mustFind(traderId);
        return followRepository.findByUserAndTrader(user, trader).orElseGet(() -> {
            CopyFollow f = CopyFollow.builder()
                    .user(user)
                    .trader(trader)
                    .copyPercent(clampPct(copyPercent, 25))
                    .maxPerTrade(orDefault(maxPerTrade, new BigDecimal("250")))
                    .dailyLimit(orDefault(dailyLimit, new BigDecimal("1500")))
                    .fundedAmount(BigDecimal.ZERO)
                    .active(true)
                    .build();
            CopyFollow saved = followRepository.save(f);
            trader.setFollowers(trader.getFollowers() + 1);
            traderRepository.save(trader);
            return saved;
        });
    }

    @Transactional
    public CopyFollow update(Long traderId, Integer copyPercent, BigDecimal maxPerTrade, BigDecimal dailyLimit, Boolean active) {
        User user = currentUser();
        Trader trader = mustFind(traderId);
        CopyFollow f = followRepository.findByUserAndTrader(user, trader)
                .orElseThrow(() -> new IllegalStateException("You are not following this trader"));
        if (copyPercent != null) f.setCopyPercent(clampPct(copyPercent, f.getCopyPercent()));
        if (maxPerTrade != null) f.setMaxPerTrade(maxPerTrade);
        if (dailyLimit != null) f.setDailyLimit(dailyLimit);
        if (active != null) f.setActive(active);
        return followRepository.save(f);
    }

    /**
     * Move money from the user's wallet balance into their copy-trading budget
     * for this trader. Also records a Transaction so it shows up in history.
     */
    @Transactional
    public CopyFollow fund(Long traderId, BigDecimal amount) {
        User user = currentUser();
        Trader trader = mustFind(traderId);
        CopyFollow f = followRepository.findByUserAndTrader(user, trader)
                .orElseThrow(() -> new IllegalStateException("You are not following this trader"));
        if (amount == null || amount.signum() <= 0)
            throw new IllegalArgumentException("Amount must be positive");

        // Debits the wallet (throws if insufficient balance).
        walletService.applyInvestment(user, amount);
        f.setFundedAmount(f.getFundedAmount().add(amount));
        followRepository.save(f);

        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.COPY_TRADING)
                .amount(amount)
                .status(TransactionStatus.COMPLETED)
                .description("Funded copy of " + trader.getName())
                .build());

        return f;
    }

    /**
     * Called by the admin when a trader trade is posted. Fans out the
     * profit/loss to every active follower proportional to their copy%,
     * capped at their maxPerTrade limit. Credits or debits each follower's
     * wallet and writes a Transaction row.
     */
    @Transactional
    public void applyTraderTradeToFollowers(Trader trader, TraderTrade trade) {
        BigDecimal magnitude = trade.getProfit() == null ? BigDecimal.ZERO : trade.getProfit().abs();
        int sign = trade.getResult() == TraderTrade.Result.WIN ? 1 : -1;
        // Follows are eagerly-loaded (user + trader) so we can safely operate outside a query loop.
        List<CopyFollow> follows = followRepository.findAll().stream()
                .filter(f -> f.isActive() && f.getTrader().getId().equals(trader.getId()))
                .toList();
        for (CopyFollow f : follows) {
            BigDecimal share = magnitude
                    .multiply(BigDecimal.valueOf(f.getCopyPercent()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Cap the per-trade impact both ways.
            if (share.compareTo(f.getMaxPerTrade()) > 0) share = f.getMaxPerTrade();

            BigDecimal signed = share.multiply(BigDecimal.valueOf(sign));
            User u = f.getUser();
            if (sign > 0) {
                walletService.applyProfit(u, signed);
            } else {
                // Loss — subtract from balance. Use adjustBalance so we don't go through the
                // withdrawal-reservation path (which would refuse to overdraft).
                walletService.adjustBalance(u, signed, WalletService.AdjustmentField.BALANCE);
            }

            transactionRepository.save(Transaction.builder()
                    .user(u)
                    .type(TransactionType.COPY_TRADING)
                    .amount(signed)
                    .status(TransactionStatus.COMPLETED)
                    .description(String.format("Copy trade from %s: %s %s %s%.2f",
                            trader.getName(), trade.getPair(), trade.getResult(),
                            sign > 0 ? "+" : "", signed.doubleValue()))
                    .build());
        }
    }

    @Transactional
    public void unfollow(Long traderId) {
        User user = currentUser();
        Trader trader = mustFind(traderId);
        followRepository.findByUserAndTrader(user, trader).ifPresent(f -> {
            followRepository.delete(f);
            if (trader.getFollowers() > 0) {
                trader.setFollowers(trader.getFollowers() - 1);
                traderRepository.save(trader);
            }
        });
    }

    private static Integer clampPct(Integer v, Integer fallback) {
        if (v == null) return fallback;
        if (v < 1) return 1;
        if (v > 100) return 100;
        return v;
    }

    private static BigDecimal orDefault(BigDecimal v, BigDecimal fallback) {
        return v == null ? fallback : v;
    }
}
