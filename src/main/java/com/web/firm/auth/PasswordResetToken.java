package com.web.firm.auth;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Single-use password reset token. Row is deleted (or marked used) once the
 * reset succeeds so a leaked email link can't be replayed.
 */
@Entity
@Table(name = "password_reset_tokens", indexes = {
        @Index(name = "idx_prt_token", columnList = "token", unique = true),
        @Index(name = "idx_prt_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, unique = true, length = 128)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant usedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
