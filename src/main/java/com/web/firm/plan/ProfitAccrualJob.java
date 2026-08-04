package com.web.firm.plan;

import com.web.firm.transaction.Transaction;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.transaction.TransactionStatus;
import com.web.firm.transaction.TransactionType;
import com.web.firm.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Ticks profit on ACTIVE {@link UserPlan}s. Each tick picks a random value from
 * the plan's {@code incrementAmount} list and applies it to the wallet, either
 * as a percentage of the principal or a fixed dollar amount.
 *
 * <p>Runs every minute and catches up missed ticks — if the interval is
 * "Hourly" but the app was down for 3 hours, three ticks are applied on the next
 * run.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProfitAccrualJob {

    private final UserPlanRepository userPlanRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @Scheduled(fixedDelay = 60_000L, initialDelay = 30_000L)
    @Transactional
    public void accrue() {
        List<UserPlan> actives = userPlanRepository.findByStatus(UserPlanStatus.ACTIVE);
        if (actives.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        for (UserPlan up : actives) {
            try {
                accrueOne(up, now);
            } catch (Exception e) {
                log.warn("Profit accrual failed for plan {}: {}", up.getId(), e.getMessage());
            }
        }
    }

    private void accrueOne(UserPlan up, LocalDateTime now) {
        InvestmentPlan plan = up.getInvestmentPlan();
        Duration tick = IntervalParser.parse(plan.getIncrementInterval());
        double[] payouts = parseAmounts(plan.getIncrementAmount());

        LocalDateTime lastAt = up.getLastAccruedAt() != null ? up.getLastAccruedAt() : up.getStartedAt();
        LocalDateTime accrueUpTo = now.isBefore(up.getEndsAt()) ? now : up.getEndsAt();

        long elapsedSeconds = Math.max(0, Duration.between(lastAt, accrueUpTo).getSeconds());
        long tickSeconds = Math.max(1, tick.getSeconds());
        long ticksDue = elapsedSeconds / tickSeconds;

        for (long i = 0; i < ticksDue; i++) {
            double picked = payouts.length > 0
                    ? payouts[ThreadLocalRandom.current().nextInt(payouts.length)]
                    : 0;
            BigDecimal slice = plan.getIncrementType() == IncrementType.PERCENTAGE
                    ? up.getAmount().multiply(BigDecimal.valueOf(picked))
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(picked).setScale(2, RoundingMode.HALF_UP);

            if (slice.signum() > 0) {
                walletService.applyProfit(up.getUser(), slice);
                up.setAccruedProfit(up.getAccruedProfit().add(slice));
                transactionRepository.save(Transaction.builder()
                        .user(up.getUser())
                        .type(TransactionType.INVESTMENT)
                        .amount(slice)
                        .status(TransactionStatus.COMPLETED)
                        .description("Profit accrual — " + plan.getName())
                        .build());
            }
        }

        if (ticksDue > 0) {
            up.setLastAccruedAt(lastAt.plusSeconds(ticksDue * tickSeconds));
        }

        if (!now.isBefore(up.getEndsAt())) {
            up.setStatus(UserPlanStatus.COMPLETED);
            if (plan.isReturnCapital()) {
                walletService.returnPrincipal(up.getUser(), up.getAmount());
                transactionRepository.save(Transaction.builder()
                        .user(up.getUser())
                        .type(TransactionType.INVESTMENT)
                        .amount(up.getAmount())
                        .status(TransactionStatus.COMPLETED)
                        .description("Principal returned — " + plan.getName())
                        .build());
            }
        }

        userPlanRepository.save(up);
    }

    private static double[] parseAmounts(String csv) {
        if (csv == null || csv.isBlank()) return new double[0];
        String[] parts = csv.split(",");
        List<Double> out = new ArrayList<>(parts.length);
        for (String p : parts) {
            try {
                out.add(Double.parseDouble(p.trim()));
            } catch (NumberFormatException ignored) { /* skip garbage */ }
        }
        double[] arr = new double[out.size()];
        for (int i = 0; i < out.size(); i++) arr[i] = out.get(i);
        return arr;
    }
}
