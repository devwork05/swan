package com.web.firm.auth;

import com.web.firm.session.UserSessionRepository;
import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    /** How long each reset link stays valid. Short window keeps the attack surface small. */
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final SettingsService settingsService;
    private final UserSessionRepository sessionRepository;

    /** Where the reset page lives on the frontend. Config-driven to keep dev/prod separate. */
    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final SecureRandom random = new SecureRandom();

    /**
     * Kicks off a reset. Deliberately always returns silently — the response
     * from the controller doesn't reveal whether the email exists, to prevent
     * account enumeration.
     */
    @Transactional
    public void requestReset(String email, HttpServletRequest http) {
        Optional<User> maybeUser = userRepository.findByEmail(email);
        if (maybeUser.isEmpty()) {
            log.info("Password reset requested for non-existent email {}", email);
            return;
        }
        User user = maybeUser.get();
        if (user.isSuspended()) {
            log.info("Password reset requested for suspended user {}", email);
            return;
        }

        // Kill any outstanding tokens for this user so only the newest link works.
        tokenRepository.deleteAllByUser(user);
        tokenRepository.flush();

        String token = generateToken();
        PasswordResetToken row = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plus(TOKEN_TTL))
                .build();
        tokenRepository.save(row);

        String link = buildResetLink(token);
        String companyName = settingsService.get().getCompanyName();
        String subject = "Reset your " + (companyName == null ? "account" : companyName) + " password";
        String html = buildEmailHtml(user.getFullName(), companyName, link);

        boolean sent = mailService.sendHtml(user.getEmail(), subject, html);
        if (!sent) {
            log.warn("Password reset requested but email failed to send for {}", email);
        }
    }

    /**
     * Validates the token, rotates the password, revokes all sessions, and
     * marks the token used. Throws IllegalArgumentException with a user-safe
     * message on any invalid state.
     */
    @Transactional
    public void consumeReset(String token, String newPassword) {
        PasswordResetToken row = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("This reset link is invalid or has already been used."));

        if (row.getUsedAt() != null) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }
        if (row.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }

        User user = row.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Any existing sessions become dead so the old password can't stay logged in.
        sessionRepository.deleteByUser(user);

        row.setUsedAt(Instant.now());
        tokenRepository.save(row);
    }

    private String generateToken() {
        byte[] bytes = new byte[48];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String buildResetLink(String token) {
        String base = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:3000" : frontendUrl.trim();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/reset-password?token=" + token;
    }

    private String buildEmailHtml(String recipientName, String companyName, String link) {
        String brand = companyName == null || companyName.isBlank() ? "our team" : companyName;
        String safeName = recipientName == null || recipientName.isBlank() ? "there" : escapeHtml(recipientName);
        long ttlMinutes = TOKEN_TTL.toMinutes();
        return "<!doctype html><html><body style=\"margin:0;padding:0;background:#f4f6fb;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding:32px 16px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"520\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:520px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px -12px rgba(1,24,64,0.15);\">"
                + "<tr><td style=\"padding:32px 32px 8px 32px;\">"
                + "<h1 style=\"margin:0;font-size:22px;color:#0f172a;\">Reset your password</h1>"
                + "<p style=\"margin:16px 0 0;font-size:14px;line-height:1.65;color:#475467;\">Hi " + safeName + ",</p>"
                + "<p style=\"margin:12px 0 0;font-size:14px;line-height:1.65;color:#475467;\">"
                + "We received a request to reset the password on your " + escapeHtml(brand) + " account. Click the button below to choose a new one. This link expires in " + ttlMinutes + " minutes."
                + "</p>"
                + "<div style=\"text-align:center;margin:28px 0;\">"
                + "<a href=\"" + link + "\" style=\"display:inline-block;background:#c1121f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.02em;\">Reset password</a>"
                + "</div>"
                + "<p style=\"margin:12px 0 0;font-size:13px;line-height:1.6;color:#64748b;\">"
                + "If the button doesn't work, copy and paste this URL into your browser:<br/>"
                + "<span style=\"word-break:break-all;color:#334155;\">" + link + "</span>"
                + "</p>"
                + "<p style=\"margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;\">"
                + "If you didn't request this reset, you can safely ignore this email — your password won't change."
                + "</p>"
                + "</td></tr>"
                + "<tr><td style=\"padding:20px 32px 28px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8;\">"
                + "&copy; " + java.time.Year.now().getValue() + " " + escapeHtml(brand) + ". All rights reserved."
                + "</td></tr>"
                + "</table>"
                + "</td></tr></table></body></html>";
    }

    private static String escapeHtml(String v) {
        return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
