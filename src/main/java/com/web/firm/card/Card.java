package com.web.firm.card;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards", indexes = {
        @Index(name = "idx_card_user", columnList = "user_id"),
        @Index(name = "idx_card_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Eager on purpose — every DTO conversion needs the owner's name/email,
     * and DTOs are built in the controller layer where the JPA session is
     * already closed. Lazy loading here throws LazyInitializationException.
     */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @ColumnDefault("'PENDING_PAYMENT'")
    @Builder.Default
    private CardStatus status = CardStatus.PENDING_PAYMENT;

    /** Full PAN — populated on approval. Null while pending / rejected. */
    @Column(length = 32)
    private String cardNumber;

    @Column(length = 8)
    private String cvv;

    /** Bcrypt hash of the 4-digit PIN. Stored only after admin approval. */
    @Column(length = 200)
    private String pin;

    @Column
    private Instant expiryDate;

    /** On-chain hash the user submitted to prove payment. */
    @Column(length = 200)
    private String paymentTransactionHash;

    /** Only used for physical cards. */
    @Column(length = 500)
    private String shippingAddress;

    @Column(length = 100)
    private String trackingNumber;

    /** Rejection reason shown to the user. */
    @Column(length = 500)
    private String rejectionReason;

    /** Internal admin notes captured on approval — echoed in the approval email. */
    @Column(length = 1000)
    private String adminNotes;

    /**
     * The user's current-primary card. Only one row per user should be true.
     * Column name explicitly set — `primary` is a reserved keyword in PostgreSQL
     * and Hibernate's default naming would emit an invalid CREATE TABLE.
     */
    @Column(name = "is_primary", nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean primary = false;

    @Column
    private Instant issuedAt;

    @Column
    private Instant activatedAt;

    @Column
    private Instant blockedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
