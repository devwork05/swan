package com.web.firm.bot;

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
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BotTradingService {

    private final TradingBotRepository botRepository;
    private final BotAllocationRepository allocationRepository;
    private final BotTradeRecordRepository tradeRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public List<TradingBot> listPublicBots() {
        return botRepository.findByPublishedTrueOrderBySortOrderAscIdAsc();
    }

    public List<BotAllocation> listMyAllocations() {
        return allocationRepository.findByUserOrderByCreatedAtDesc(currentUser());
    }

    public List<BotTradeRecord> listMyHistory() {
        return tradeRepository.findByUserOrderByTradedAtDesc(currentUser());
    }

    @Transactional
    public BotAllocation start(Long botId, BigDecimal amount, String pair) {
        User user = currentUser();
        TradingBot bot = botRepository.findById(botId)
                .orElseThrow(() -> new IllegalArgumentException("Bot not found"));
        if (amount == null || amount.compareTo(bot.getMinInvestment()) < 0)
            throw new IllegalArgumentException("Minimum investment is " + bot.getMinInvestment());
        if (pair == null || pair.isBlank())
            throw new IllegalArgumentException("Pair is required");

        // Debits wallet balance — throws if insufficient.
        walletService.applyInvestment(user, amount);

        BotAllocation a = BotAllocation.builder()
                .user(user)
                .bot(bot)
                .amount(amount)
                .pair(pair.trim())
                .status(BotAllocation.Status.ACTIVE)
                .seedPnl(BigDecimal.ZERO)
                .build();
        BotAllocation saved = allocationRepository.save(a);

        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.BOT_TRADING)
                .amount(amount)
                .status(TransactionStatus.COMPLETED)
                .description("Started " + bot.getName() + " on " + pair.trim())
                .build());

        return saved;
    }

    /**
     * Stop an active allocation and return the principal + accrued P&L to the
     * user's wallet balance.
     */
    @Transactional
    public BotAllocation stop(Long allocationId) {
        User user = currentUser();
        BotAllocation a = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));
        if (!a.getUser().getId().equals(user.getId()))
            throw new IllegalStateException("You cannot modify this allocation");
        if (a.getStatus() != BotAllocation.Status.ACTIVE)
            throw new IllegalStateException("Allocation is not active");

        // Return the principal to the user's wallet. Any per-trade P&L was already
        // applied as trades fired, so no need to re-apply seedPnl here.
        walletService.adjustBalance(user, a.getAmount(), WalletService.AdjustmentField.BALANCE);
        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.BOT_TRADING)
                .amount(a.getAmount())
                .status(TransactionStatus.COMPLETED)
                .description("Stopped " + a.getBot().getName() + " — principal returned")
                .build());

        a.setStatus(BotAllocation.Status.STOPPED);
        a.setStoppedAt(Instant.now());
        return allocationRepository.save(a);
    }
}
