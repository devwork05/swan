package com.web.firm.plan;

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
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final UserPlanRepository userPlanRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @Transactional
    public UserPlanDto invest(Long planId, InvestRequest req) {
        User user = currentUser();
        InvestmentPlan plan = investmentPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        if (!plan.isActive()) {
            throw new IllegalStateException("Plan is not active");
        }
        if (req.getAmount().compareTo(plan.getMinAmount()) < 0) {
            throw new IllegalArgumentException("Amount below plan minimum");
        }
        if (req.getAmount().compareTo(plan.getMaxAmount()) > 0) {
            throw new IllegalArgumentException("Amount above plan maximum");
        }

        walletService.applyInvestment(user, req.getAmount());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endsAt = DurationParser.addTo(now, plan.getDuration());
        BigDecimal expectedReturn = estimateReturn(plan, req.getAmount(), now, endsAt);

        UserPlan up = userPlanRepository.save(UserPlan.builder()
                .user(user)
                .investmentPlan(plan)
                .amount(req.getAmount())
                .status(UserPlanStatus.ACTIVE)
                .startedAt(now)
                .endsAt(endsAt)
                .expectedReturn(expectedReturn)
                .accruedProfit(BigDecimal.ZERO)
                .lastAccruedAt(now)
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.INVESTMENT)
                .amount(req.getAmount())
                .status(TransactionStatus.COMPLETED)
                .description("Invested in " + plan.getName())
                .build());

        if (plan.getBonus() != null && plan.getBonus().signum() > 0) {
            walletService.adjustBalance(user, plan.getBonus(), WalletService.AdjustmentField.BONUS);
            transactionRepository.save(Transaction.builder()
                    .user(user)
                    .type(TransactionType.REFERRAL_BONUS)
                    .amount(plan.getBonus())
                    .status(TransactionStatus.COMPLETED)
                    .description("Plan bonus — " + plan.getName())
                    .build());
        }

        payReferrerOnce(user, plan);

        return UserPlanDto.fromEntity(up);
    }

    /**
     * Credits the user's referrer their one-time referral bonus (drawn from this
     * plan's {@code referralBonus} field). No-op if the user has no referrer, the
     * plan has no referral bonus configured, or we've already paid it.
     */
    private void payReferrerOnce(User user, InvestmentPlan plan) {
        if (user.isReferralBonusPaid()) return;
        if (user.getReferrerId() == null) return;
        BigDecimal bonus = plan.getReferralBonus();
        if (bonus == null || bonus.signum() <= 0) return;

        User referrer = userRepository.findById(user.getReferrerId()).orElse(null);
        if (referrer == null || referrer.isSuspended()) return;

        walletService.adjustBalance(referrer, bonus, WalletService.AdjustmentField.REFERRAL_BONUS);
        transactionRepository.save(Transaction.builder()
                .user(referrer)
                .type(TransactionType.REFERRAL_BONUS)
                .amount(bonus)
                .status(TransactionStatus.COMPLETED)
                .description("Referral bonus — " + user.getEmail() + " invested in " + plan.getName())
                .build());

        user.setReferralBonusPaid(true);
        userRepository.save(user);
    }

    /**
     * Best-effort projection of what the user will earn over the plan's lifetime.
     * Uses the average of the incrementAmount values (or midpoint of minReturn/maxReturn
     * if the list can't be parsed) applied per tick, capped at the plan duration.
     */
    private BigDecimal estimateReturn(InvestmentPlan plan, BigDecimal principal, LocalDateTime start, LocalDateTime end) {
        Duration tick = IntervalParser.parse(plan.getIncrementInterval());
        long totalSeconds = Math.max(1, Duration.between(start, end).getSeconds());
        long ticks = Math.max(1, totalSeconds / Math.max(1, tick.getSeconds()));

        double avgIncrement = avgIncrementAmount(plan.getIncrementAmount());
        if (avgIncrement <= 0) {
            // fall back to midpoint of min/max return spread over duration
            avgIncrement = (plan.getMinReturn().doubleValue() + plan.getMaxReturn().doubleValue()) / 2.0 / ticks;
        }

        BigDecimal perTick = plan.getIncrementType() == IncrementType.PERCENTAGE
                ? principal.multiply(BigDecimal.valueOf(avgIncrement))
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(avgIncrement);

        return perTick.multiply(BigDecimal.valueOf(ticks)).setScale(2, RoundingMode.HALF_UP);
    }

    static double avgIncrementAmount(String csv) {
        if (csv == null || csv.isBlank()) return 0;
        String[] parts = csv.split(",");
        double sum = 0;
        int count = 0;
        for (String p : parts) {
            try {
                sum += Double.parseDouble(p.trim());
                count++;
            } catch (NumberFormatException ignored) { /* skip garbage */ }
        }
        return count == 0 ? 0 : sum / count;
    }

    @Transactional(readOnly = true)
    public List<UserPlanDto> listForCurrentUser() {
        return userPlanRepository.findByUserOrderByCreatedAtDesc(currentUser()).stream()
                .map(UserPlanDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserPlanDto> listAll() {
        return userPlanRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(UserPlanDto::fromEntity)
                .toList();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
