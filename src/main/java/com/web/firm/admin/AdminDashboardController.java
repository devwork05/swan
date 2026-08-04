package com.web.firm.admin;

import com.web.firm.deposit.DepositRepository;
import com.web.firm.deposit.DepositStatus;
import com.web.firm.plan.UserPlanRepository;
import com.web.firm.plan.UserPlanStatus;
import com.web.firm.transaction.TransactionDto;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.user.UserRepository;
import com.web.firm.wallet.Wallet;
import com.web.firm.wallet.WalletRepository;
import com.web.firm.withdraw.WithdrawRepository;
import com.web.firm.withdraw.WithdrawStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final DepositRepository depositRepository;
    private final WithdrawRepository withdrawRepository;
    private final UserPlanRepository userPlanRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> stats() {
        List<Wallet> wallets = walletRepository.findAll();
        BigDecimal totalDeposited = wallets.stream().map(Wallet::getTotalDeposited).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWithdrawn = wallets.stream().map(Wallet::getTotalWithdrawn).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalBalance = wallets.stream().map(Wallet::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = wallets.stream().map(Wallet::getTotalProfit).reduce(BigDecimal.ZERO, BigDecimal::add);

        AdminStatsDto stats = AdminStatsDto.builder()
                .totalUsers(userRepository.count())
                .pendingDeposits(depositRepository.countByStatus(DepositStatus.PENDING))
                .pendingWithdrawals(withdrawRepository.countByStatus(WithdrawStatus.PENDING))
                .activePlans(userPlanRepository.countByStatus(UserPlanStatus.ACTIVE))
                .totalDeposited(totalDeposited)
                .totalWithdrawn(totalWithdrawn)
                .totalBalance(totalBalance)
                .totalProfit(totalProfit)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> allTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(TransactionDto::fromEntity)
                .toList());
    }
}
