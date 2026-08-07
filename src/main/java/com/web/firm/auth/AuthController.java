package com.web.firm.auth;

import com.web.firm.config.JwtUtil;
import com.web.firm.session.UserSessionRepository;
import com.web.firm.user.UserDto;
import com.web.firm.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(authService.register(request, http));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(request, http));
    }

    /**
     * "Who am I" — the frontend hits this on every layout mount to verify the token
     * (session hasn't been revoked, user still exists) and to get fresh profile data.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return userRepository.findByEmail(authentication.getName())
                .map(u -> ResponseEntity.ok(UserDto.fromEntity(u)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    /** Revoke the session for the JWT on this request. Used by clients to sign out cleanly. */
    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<Void> logout(HttpServletRequest http) {
        String header = http.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String jti = jwtUtil.extractJti(header.substring(7));
            if (jti != null) sessionRepository.deleteByJti(jti);
        }

        return ResponseEntity.noContent().build();
    }

    /**
     * Send a reset link to the user's email. Always returns 200 to prevent
     * account enumeration — the response tells the caller a message will be
     * sent iff the address is registered.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req,
            HttpServletRequest http) {
        passwordResetService.requestReset(req.getEmail(), http);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "If an account exists for that email, a reset link is on its way."));
    }

    /** Consume a reset token and set a new password. */
    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        passwordResetService.consumeReset(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Password updated. You can now sign in with your new password."));
    }
}
