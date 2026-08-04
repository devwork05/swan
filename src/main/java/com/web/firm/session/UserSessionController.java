package com.web.firm.session;

import com.web.firm.config.JwtUtil;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Self-service session management. Users can see their own devices and revoke
 * any of them. The response marks the caller's current session so the UI can
 * label it "This device" and refuse to revoke it.
 */
@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class UserSessionController {

    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<SessionDto>> list(HttpServletRequest http) {
        User me = currentUser();
        String currentJti = extractCurrentJti(http);
        List<SessionDto> out = sessionRepository.findByUserOrderByLastActiveDesc(me).stream()
                .map(s -> {
                    SessionDto dto = SessionDto.fromEntity(s);
                    dto.setCurrent(s.getJti().equals(currentJti));
                    return dto;
                })
                .toList();
        return ResponseEntity.ok(out);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> revoke(@PathVariable Long id, HttpServletRequest http) {
        User me = currentUser();
        UserSession s = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!s.getUser().getId().equals(me.getId())) {
            throw new IllegalArgumentException("Not your session");
        }
        String currentJti = extractCurrentJti(http);
        if (s.getJti().equals(currentJti)) {
            throw new IllegalArgumentException("Use /auth/logout to revoke your current session");
        }
        sessionRepository.delete(s);
        return ResponseEntity.noContent().build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String extractCurrentJti(HttpServletRequest http) {
        String header = http.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return jwtUtil.extractJti(header.substring(7));
        }
        return null;
    }
}
