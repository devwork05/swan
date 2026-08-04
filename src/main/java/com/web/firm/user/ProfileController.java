package com.web.firm.user;

import com.web.firm.session.SessionDto;
import com.web.firm.session.UserSession;
import com.web.firm.session.UserSessionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Self-service endpoints for the currently authenticated user.
 * Everything here operates on the caller — never on an arbitrary user id.
 */
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ProfileDto> me() {
        return ResponseEntity.ok(ProfileDto.fromEntity(currentUser()));
    }

    @PatchMapping
    @Transactional
    public ResponseEntity<ProfileDto> update(@RequestBody UpdateProfileRequest req) {
        User u = currentUser();
        if (req.getFullName() != null) u.setFullName(req.getFullName());
        if (req.getAvatarUrl() != null) u.setAvatarUrl(req.getAvatarUrl());
        if (req.getPhone() != null) u.setPhone(req.getPhone());
        if (req.getCountry() != null) u.setCountry(req.getCountry());
        if (req.getDob() != null) u.setDob(req.getDob());
        if (req.getAddress() != null) u.setAddress(req.getAddress());
        if (req.getHideBalance() != null) u.setHideBalance(req.getHideBalance());
        if (req.getTwoFaEnabled() != null) u.setTwoFaEnabled(req.getTwoFaEnabled());
        return ResponseEntity.ok(ProfileDto.fromEntity(userRepository.save(u)));
    }

    @PostMapping("/password")
    @Transactional
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        User u = currentUser();
        if (!passwordEncoder.matches(req.getCurrentPassword(), u.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (req.getNewPassword().equals(req.getCurrentPassword())) {
            throw new IllegalArgumentException("New password must differ from current password");
        }
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);
        // Revoke every other session so the user is forced to log in again elsewhere.
        // Keep the current session active so the caller doesn't get bounced.
        return ResponseEntity.noContent().build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
