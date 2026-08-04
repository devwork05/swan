package com.web.firm.admin;

import com.web.firm.auth.AuthResponse;
import com.web.firm.auth.AuthService;
import com.web.firm.session.SessionDto;
import com.web.firm.session.UserSession;
import com.web.firm.session.UserSessionRepository;
import com.web.firm.transaction.Transaction;
import com.web.firm.transaction.TransactionDto;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.transaction.TransactionStatus;
import com.web.firm.transaction.TransactionType;
import com.web.firm.user.KycStatus;
import com.web.firm.user.Role;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import com.web.firm.wallet.Wallet;
import com.web.firm.wallet.WalletRepository;
import com.web.firm.wallet.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AdminUserDto>> list() {
        List<AdminUserDto> users = userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(findUser(id)));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<AdminUserDto> update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        User u = findUser(id);
        if (req.getFullName() != null) u.setFullName(req.getFullName());
        if (req.getEmail() != null) u.setEmail(req.getEmail());
        if (req.getRole() != null) u.setRole(Role.valueOf(req.getRole()));
        if (req.getPhone() != null) u.setPhone(req.getPhone());
        if (req.getCountry() != null) u.setCountry(req.getCountry());
        if (req.getDob() != null) u.setDob(req.getDob());
        if (req.getAddress() != null) u.setAddress(req.getAddress());
        if (req.getWithdrawStatus() != null) u.setWithdrawStatus(req.getWithdrawStatus());
        if (req.getTwoFaEnabled() != null) u.setTwoFaEnabled(req.getTwoFaEnabled());
        if (req.getHideBalance() != null) u.setHideBalance(req.getHideBalance());
        if (req.getSuspended() != null) u.setSuspended(req.getSuspended());
        if (req.getKycStatus() != null) {
            KycStatus newStatus = KycStatus.valueOf(req.getKycStatus());
            u.setKycStatus(newStatus);
            u.setKycVerifiedAt(newStatus == KycStatus.VERIFIED ? LocalDateTime.now() : null);
        } else if (req.getKycVerified() != null) {
            u.setKycStatus(req.getKycVerified() ? KycStatus.VERIFIED : KycStatus.NONE);
            u.setKycVerifiedAt(req.getKycVerified() ? LocalDateTime.now() : null);
        }
        userRepository.save(u);
        return ResponseEntity.ok(toDto(u));
    }

    @PostMapping("/{id}/adjust")
    @Transactional
    public ResponseEntity<AdminUserDto> adjust(@PathVariable Long id, @Valid @RequestBody AdjustBalanceRequest req) {
        User u = findUser(id);
        WalletService.AdjustmentField field = WalletService.AdjustmentField.valueOf(req.getField());
        walletService.adjustBalance(u, req.getAmount(), field);
        transactionRepository.save(Transaction.builder()
                .user(u)
                .type(req.getAmount().signum() >= 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL)
                .amount(req.getAmount().abs())
                .status(TransactionStatus.COMPLETED)
                .description("Admin adjustment (" + req.getField() + ")"
                        + (req.getReason() != null ? ": " + req.getReason() : ""))
                .build());
        return ResponseEntity.ok(toDto(u));
    }

    @PostMapping("/{id}/password")
    @Transactional
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordResetRequest req) {
        User u = findUser(id);
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(u);
        // Revoke every session so the user is forced to log in again.
        sessionRepository.findByUserOrderByLastActiveDesc(u).forEach(sessionRepository::delete);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/impersonate")
    @Transactional
    public ResponseEntity<AuthResponse> impersonate(@PathVariable Long id, HttpServletRequest http) {
        User target = findUser(id);
        return ResponseEntity.ok(authService.issueTokenForUser(target, http));
    }

    @PostMapping("/{id}/clear")
    @Transactional
    public ResponseEntity<AdminUserDto> clear(@PathVariable Long id, @RequestBody ClearAccountRequest req) {
        User u = findUser(id);
        Wallet w = walletRepository.findByUserEmail(u.getEmail()).orElse(null);
        List<String> targets = req.getTargets() == null ? List.of() : req.getTargets();

        if (w != null) {
            for (String t : targets) {
                switch (t.toUpperCase()) {
                    case "BALANCE" -> w.setBalance(BigDecimal.ZERO);
                    case "BONUS" -> w.setBonus(BigDecimal.ZERO);
                    case "REFERRAL" -> w.setReferralBonus(BigDecimal.ZERO);
                    case "PROFIT" -> w.setTotalProfit(BigDecimal.ZERO);
                    default -> { /* ignore unknown targets */ }
                }
            }
            walletRepository.save(w);
        }

        if (targets.stream().anyMatch(s -> s.equalsIgnoreCase("HISTORY"))) {
            transactionRepository.findByUserOrderByCreatedAtDesc(u).forEach(transactionRepository::delete);
        }

        transactionRepository.save(Transaction.builder()
                .user(u)
                .type(TransactionType.TRANSFER)
                .amount(BigDecimal.ZERO)
                .status(TransactionStatus.COMPLETED)
                .description("Admin cleared: " + String.join(", ", targets))
                .build());

        return ResponseEntity.ok(toDto(u));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User u = findUser(id);
        // Wipe children that would otherwise block deletion.
        sessionRepository.findByUserOrderByLastActiveDesc(u).forEach(sessionRepository::delete);
        transactionRepository.findByUserOrderByCreatedAtDesc(u).forEach(transactionRepository::delete);
        walletRepository.findByUserEmail(u.getEmail()).ifPresent(walletRepository::delete);
        userRepository.delete(u);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<SessionDto>> sessions(@PathVariable Long id) {
        User u = findUser(id);
        return ResponseEntity.ok(sessionRepository.findByUserOrderByLastActiveDesc(u).stream()
                .map(SessionDto::fromEntity)
                .toList());
    }

    @DeleteMapping("/{id}/sessions/{sessionId}")
    @Transactional
    public ResponseEntity<Void> revokeSession(@PathVariable Long id, @PathVariable Long sessionId) {
        UserSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!s.getUser().getId().equals(id)) {
            throw new IllegalArgumentException("Session does not belong to this user");
        }
        sessionRepository.delete(s);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/referrals")
    public ResponseEntity<List<AdminUserDto>> referrals(@PathVariable Long id) {
        // Just confirm the user exists so we return 400 for bad ids.
        findUser(id);
        return ResponseEntity.ok(userRepository.findByReferrerIdOrderByCreatedAtDesc(id).stream()
                .map(this::toDto)
                .toList());
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDto>> userTransactions(
            @PathVariable Long id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        User u = findUser(id);
        return ResponseEntity.ok(transactionRepository.findByUserOrderByCreatedAtDesc(u).stream()
                .filter(t -> type == null || t.getType().name().equalsIgnoreCase(type))
                .filter(t -> status == null || t.getStatus().name().equalsIgnoreCase(status))
                .map(TransactionDto::fromEntity)
                .toList());
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private AdminUserDto toDto(User u) {
        Wallet w = walletRepository.findByUserEmail(u.getEmail()).orElse(null);
        String referrerEmail = null;
        if (u.getReferrerId() != null) {
            referrerEmail = userRepository.findById(u.getReferrerId()).map(User::getEmail).orElse(null);
        }
        long refCount = userRepository.countByReferrerId(u.getId());
        return AdminUserDto.from(u, w, referrerEmail, refCount);
    }
}
