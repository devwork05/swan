package com.web.firm.auth;

import com.web.firm.config.JwtUtil;
import com.web.firm.session.UserSession;
import com.web.firm.session.UserSessionRepository;
import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
import com.web.firm.transaction.Transaction;
import com.web.firm.transaction.TransactionRepository;
import com.web.firm.transaction.TransactionStatus;
import com.web.firm.transaction.TransactionType;
import com.web.firm.user.KycStatus;
import com.web.firm.user.Role;
import com.web.firm.user.User;
import com.web.firm.user.UserDto;
import com.web.firm.user.UserRepository;
import com.web.firm.wallet.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final WalletService walletService;
    private final SettingsService settingsService;
    private final TransactionRepository transactionRepository;
    private final UserSessionRepository sessionRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest http) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Long referrerId = resolveReferrer(request.getReferredBy());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.USER)
                .kycStatus(KycStatus.NONE)
                .referrerId(referrerId)
                .build();

        User savedUser = userRepository.save(user);
        walletService.createWallet(savedUser);

        PlatformSetting cfg = settingsService.get();
        if (cfg.isWelcomeBonusEnabled() && cfg.getWelcomeBonusAmount().signum() > 0) {
            walletService.adjustBalance(savedUser, cfg.getWelcomeBonusAmount(), WalletService.AdjustmentField.BONUS);
            transactionRepository.save(Transaction.builder()
                    .user(savedUser)
                    .type(TransactionType.REFERRAL_BONUS)
                    .amount(cfg.getWelcomeBonusAmount())
                    .status(TransactionStatus.COMPLETED)
                    .description("Welcome bonus")
                    .build());
        }

        return issueToken(savedUser, http);
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest http) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isSuspended()) {
            throw new RuntimeException("Account suspended. Contact support.");
        }

        // Authentication above already validated credentials.
        return issueToken(user, http);
    }

    /** Admin utility — mint a token for an arbitrary user (impersonation). */
    @Transactional
    public AuthResponse issueTokenForUser(User user, HttpServletRequest http) {
        return issueToken(user, http);
    }

    private AuthResponse issueToken(User user, HttpServletRequest http) {
        String jti = UUID.randomUUID().toString();
        String token = jwtUtil.generateToken(user.getEmail(), jti);
        sessionRepository.save(UserSession.builder()
                .user(user)
                .jti(jti)
                .ipAddress(clientIp(http))
                .userAgent(http == null ? null : http.getHeader("User-Agent"))
                .lastActive(LocalDateTime.now())
                .build());
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    private Long resolveReferrer(String referredBy) {
        if (referredBy == null || referredBy.isBlank()) return null;
        String s = referredBy.trim();
        try {
            long id = Long.parseLong(s);
            return userRepository.findById(id).map(User::getId).orElse(null);
        } catch (NumberFormatException ignored) {
            return userRepository.findByEmail(s).map(User::getId).orElse(null);
        }
    }

    private static String clientIp(HttpServletRequest http) {
        if (http == null) return null;
        String xff = http.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return http.getRemoteAddr();
    }
}
