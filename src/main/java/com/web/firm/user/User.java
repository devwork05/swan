package com.web.firm.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Profile — optional. */
    @Column(length = 500)
    private String avatarUrl;

    @Column
    private String phone;

    @Column
    private String country;

    @Column
    private LocalDate dob;

    @Column(columnDefinition = "TEXT")
    private String address;

    /** Self-FK to the user who referred this account. */
    @Column
    private Long referrerId;

    /** True once we've credited the referrer their one-time bonus for this user. */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean referralBonusPaid = false;

    /** Per-user override; when false blocks withdrawals for this user even if global toggle is on. */
    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean withdrawStatus = true;

    /** Set by admin from the security tab. Persistence of the shared secret is deliberately out of scope. */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean twoFaEnabled = false;

    /** User preference to mask balances in the UI. */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean hideBalance = false;

    /** Suspending an account disables login and withdrawals. */
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean suspended = false;

    /** Admin PIN for sensitive per-user operations (hashed). */
    @Column
    private String pin;

    /** KYC status now tri-state (was boolean). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'NONE'")
    @Builder.Default
    private KycStatus kycStatus = KycStatus.NONE;

    @Column
    private LocalDateTime kycVerifiedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** Legacy read for older callers — VERIFIED == true. */
    public boolean isKycVerified() {
        return kycStatus == KycStatus.VERIFIED;
    }
}
