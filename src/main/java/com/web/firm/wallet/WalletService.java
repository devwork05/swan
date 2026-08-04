package com.web.firm.wallet;

import com.web.firm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    @Transactional
    public Wallet createWallet(User user) {
        if (walletRepository.existsByUserId(user.getId())) {
            return walletRepository.findByUserEmail(user.getEmail()).orElseThrow();
        }

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .bonus(BigDecimal.ZERO)
                .referralBonus(BigDecimal.ZERO)
                .lockedBalance(BigDecimal.ZERO)
                .totalDeposited(BigDecimal.ZERO)
                .totalWithdrawn(BigDecimal.ZERO)
                .totalProfit(BigDecimal.ZERO)
                .build();

        return walletRepository.save(wallet);
    }

    @Transactional(readOnly = true)
    public Wallet getWalletForCurrentUser() {
        String email = getCurrentUserEmail();
        return walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
    }

    @Transactional(readOnly = true)
    public Wallet getWalletFor(User user) {
        return walletRepository.findByUserEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Wallet not found for user " + user.getEmail()));
    }

    @Transactional(readOnly = true)
    public WalletDto getWalletDto() {
        return WalletDto.fromEntity(getWalletForCurrentUser());
    }

    @Transactional(readOnly = true)
    public WalletSummaryDto getWalletSummary() {
        return WalletSummaryDto.fromEntity(getWalletForCurrentUser());
    }

    /** Credit balance from an approved deposit. */
    @Transactional
    public void applyDepositApproval(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        w.setBalance(w.getBalance().add(amount));
        w.setTotalDeposited(w.getTotalDeposited().add(amount));
        walletRepository.save(w);
    }

    /** Reserve funds when a withdrawal is requested. Throws if insufficient. */
    @Transactional
    public void reserveWithdrawal(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        if (w.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        w.setBalance(w.getBalance().subtract(amount));
        walletRepository.save(w);
    }

    /** Finalise a withdrawal once admin approves it. */
    @Transactional
    public void finaliseWithdrawal(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        w.setTotalWithdrawn(w.getTotalWithdrawn().add(amount));
        walletRepository.save(w);
    }

    /** Refund a rejected withdrawal. */
    @Transactional
    public void refundWithdrawal(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        w.setBalance(w.getBalance().add(amount));
        walletRepository.save(w);
    }

    /** Debit balance when user invests in a plan. Throws if insufficient. */
    @Transactional
    public void applyInvestment(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        if (w.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        w.setBalance(w.getBalance().subtract(amount));
        walletRepository.save(w);
    }

    /** Credit profit from an active plan. */
    @Transactional
    public void applyProfit(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        w.setBalance(w.getBalance().add(amount));
        w.setTotalProfit(w.getTotalProfit().add(amount));
        walletRepository.save(w);
    }

    /** Return principal when a plan completes. */
    @Transactional
    public void returnPrincipal(User user, BigDecimal amount) {
        Wallet w = getWalletFor(user);
        w.setBalance(w.getBalance().add(amount));
        walletRepository.save(w);
    }

    /** Admin balance adjustment: positive adds, negative subtracts. */
    @Transactional
    public void adjustBalance(User user, BigDecimal delta, AdjustmentField field) {
        Wallet w = getWalletFor(user);
        switch (field) {
            case BALANCE -> w.setBalance(w.getBalance().add(delta));
            case BONUS -> w.setBonus(w.getBonus().add(delta));
            case REFERRAL_BONUS -> w.setReferralBonus(w.getReferralBonus().add(delta));
            case PROFIT -> {
                w.setBalance(w.getBalance().add(delta));
                w.setTotalProfit(w.getTotalProfit().add(delta));
            }
        }
        walletRepository.save(w);
    }

    public enum AdjustmentField {
        BALANCE, BONUS, REFERRAL_BONUS, PROFIT
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
