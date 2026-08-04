package com.web.firm.withdraw;

import com.web.firm.deposit.DepositMethod;
import com.web.firm.deposit.DepositMethodRepository;
import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class WithdrawService {

    private final WithdrawRepository withdrawRepository;
    private final DepositMethodRepository depositMethodRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;
    private final SettingsService settingsService;

    @Transactional
    public WithdrawDto create(CreateWithdrawRequest req) {
        User user = currentUser();
        DepositMethod method = depositMethodRepository.findById(req.getMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal method not found"));

        PlatformSetting cfg = settingsService.get();
        if (!cfg.isWithdrawEnabled()) {
            throw new IllegalStateException("Withdrawals are currently disabled");
        }
        if (cfg.isKycRequiredForWithdrawal() && !user.isKycVerified()) {
            throw new IllegalStateException("KYC verification required before withdrawing");
        }
        if (req.getAmount().compareTo(cfg.getMinWithdraw()) < 0) {
            throw new IllegalArgumentException("Minimum withdrawal is " + cfg.getMinWithdraw());
        }
        if (req.getAmount().compareTo(method.getMinAmount()) < 0) {
            throw new IllegalArgumentException("Minimum for " + method.getSymbol() + " is " + method.getMinAmount());
        }
        if (method.getMaxAmount() != null && req.getAmount().compareTo(method.getMaxAmount()) > 0) {
            throw new IllegalArgumentException("Maximum for " + method.getSymbol() + " is " + method.getMaxAmount());
        }

        walletService.reserveWithdrawal(user, req.getAmount());

        Withdraw w = withdrawRepository.save(Withdraw.builder()
                .user(user)
                .method(method)
                .amount(req.getAmount())
                .walletAddress(req.getWalletAddress())
                .status(WithdrawStatus.PENDING)
                .trxid(generateTrxid("WDR"))
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.WITHDRAWAL)
                .amount(req.getAmount())
                .status(TransactionStatus.PENDING)
                .description("Withdrawal via " + method.getSymbol())
                .build());

        return WithdrawDto.fromEntity(w);
    }

    @Transactional(readOnly = true)
    public List<WithdrawDto> listForCurrentUser() {
        return withdrawRepository.findByUserOrderByCreatedAtDesc(currentUser()).stream()
                .map(WithdrawDto::fromEntity)
                .toList();
    }

    @Transactional
    public WithdrawDto approve(Long id) {
        Withdraw w = withdrawRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal not found"));
        if (w.getStatus() != WithdrawStatus.PENDING) {
            throw new IllegalStateException("Only pending withdrawals can be approved");
        }
        w.setStatus(WithdrawStatus.COMPLETED);
        walletService.finaliseWithdrawal(w.getUser(), w.getAmount());
        markLastMatchingTransaction(w.getUser().getId(), w.getAmount(), TransactionStatus.COMPLETED);
        return WithdrawDto.fromEntity(w);
    }

    @Transactional
    public WithdrawDto reject(Long id, String reason) {
        Withdraw w = withdrawRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal not found"));
        if (w.getStatus() != WithdrawStatus.PENDING) {
            throw new IllegalStateException("Only pending withdrawals can be rejected");
        }
        w.setStatus(WithdrawStatus.REJECTED);
        w.setRejectionReason(reason);
        walletService.refundWithdrawal(w.getUser(), w.getAmount());
        markLastMatchingTransaction(w.getUser().getId(), w.getAmount(), TransactionStatus.CANCELLED);
        return WithdrawDto.fromEntity(w);
    }

    @Transactional(readOnly = true)
    public List<WithdrawDto> listAll() {
        return withdrawRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(WithdrawDto::fromEntity)
                .toList();
    }

    private void markLastMatchingTransaction(Long userId, java.math.BigDecimal amount, TransactionStatus status) {
        // Best-effort: update the most recent pending withdrawal txn for that user/amount
        transactionRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .filter(t -> t.getType() == TransactionType.WITHDRAWAL)
                .filter(t -> t.getStatus() == TransactionStatus.PENDING)
                .filter(t -> t.getAmount().compareTo(amount) == 0)
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .ifPresent(t -> {
                    t.setStatus(status);
                    transactionRepository.save(t);
                });
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private static String generateTrxid(String prefix) {
        return prefix + "-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
