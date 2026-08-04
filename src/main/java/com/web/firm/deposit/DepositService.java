package com.web.firm.deposit;

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

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final DepositMethodRepository depositMethodRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;
    private final SettingsService settingsService;

    @Transactional
    public DepositDto create(CreateDepositRequest req) {
        User user = currentUser();
        DepositMethod method = depositMethodRepository.findById(req.getDepositMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Deposit method not found"));

        PlatformSetting cfg = settingsService.get();
        if (req.getAmount().compareTo(cfg.getMinDeposit()) < 0) {
            throw new IllegalArgumentException("Minimum deposit is " + cfg.getMinDeposit());
        }
        if (req.getAmount().compareTo(method.getMinAmount()) < 0) {
            throw new IllegalArgumentException("Minimum for " + method.getSymbol() + " is " + method.getMinAmount());
        }
        if (method.getMaxAmount() != null && req.getAmount().compareTo(method.getMaxAmount()) > 0) {
            throw new IllegalArgumentException("Maximum for " + method.getSymbol() + " is " + method.getMaxAmount());
        }

        Deposit d = depositRepository.save(Deposit.builder()
                .user(user)
                .depositMethod(method)
                .amount(req.getAmount())
                .status(DepositStatus.PENDING)
                .trxid(generateTrxid("DEP"))
                .trxHash(req.getTrxHash())
                .proofFileName(req.getProofUrl())
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .type(TransactionType.DEPOSIT)
                .amount(req.getAmount())
                .status(TransactionStatus.PENDING)
                .description("Deposit via " + method.getSymbol())
                .build());

        return DepositDto.fromEntity(d);
    }

    @Transactional(readOnly = true)
    public List<DepositDto> listForCurrentUser() {
        return depositRepository.findByUserOrderByCreatedAtDesc(currentUser()).stream()
                .map(DepositDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepositDto getForCurrentUser(Long id) {
        return DepositDto.fromEntity(depositRepository.findByIdAndUser(id, currentUser())
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found")));
    }

    @Transactional
    public DepositDto approve(Long id) {
        Deposit d = depositRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found"));
        if (d.getStatus() != DepositStatus.PENDING) {
            throw new IllegalStateException("Only pending deposits can be approved");
        }
        d.setStatus(DepositStatus.COMPLETED);
        walletService.applyDepositApproval(d.getUser(), d.getAmount());
        markLastMatchingTransaction(d.getUser().getId(), d.getAmount(), TransactionStatus.COMPLETED);
        return DepositDto.fromEntity(d);
    }

    @Transactional
    public DepositDto reject(Long id) {
        Deposit d = depositRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found"));
        if (d.getStatus() != DepositStatus.PENDING) {
            throw new IllegalStateException("Only pending deposits can be rejected");
        }
        d.setStatus(DepositStatus.REJECTED);
        markLastMatchingTransaction(d.getUser().getId(), d.getAmount(), TransactionStatus.FAILED);
        return DepositDto.fromEntity(d);
    }

    @Transactional(readOnly = true)
    public List<DepositDto> listAll() {
        return depositRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DepositDto::fromEntity)
                .toList();
    }

    private void markLastMatchingTransaction(Long userId, BigDecimal amount, TransactionStatus status) {
        transactionRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .filter(t -> t.getType() == TransactionType.DEPOSIT)
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
