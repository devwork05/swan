package com.web.firm.session;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * One row per authenticated JWT. Rows are created on login / register and
 * updated on every authenticated request. Deleting a row revokes the token
 * (the JwtAuthenticationFilter rejects unknown jtis).
 */
@Entity
@Table(name = "user_sessions", indexes = {@Index(name = "idx_session_jti", columnList = "jti", unique = true)})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String jti;

    @Column
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column
    @Builder.Default
    private LocalDateTime lastActive = LocalDateTime.now();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
