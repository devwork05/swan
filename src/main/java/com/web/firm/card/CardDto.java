package com.web.firm.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    private CardType type;
    private CardStatus status;

    private String cardNumber;   // Full PAN — admin sees it in full; user sees it in full for their own card.
    private String cvv;
    private String pin;          // Hash. Only exposed to admin — never returned to user.
    private Instant expiryDate;

    private String paymentTransactionHash;
    private String shippingAddress;
    private String trackingNumber;
    private String rejectionReason;
    private String adminNotes;
    private boolean primary;

    private Instant issuedAt;
    private Instant activatedAt;
    private Instant blockedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Admin view — includes card number, CVV, and pin hash. */
    public static CardDto forAdmin(Card c) {
        return baseBuilder(c)
                .cardNumber(c.getCardNumber())
                .cvv(c.getCvv())
                .pin(c.getPin())
                .adminNotes(c.getAdminNotes())
                .build();
    }

    /** User view — full PAN + CVV for their own card, but never the PIN hash or admin notes. */
    public static CardDto forOwner(Card c) {
        return baseBuilder(c)
                .cardNumber(c.getCardNumber())
                .cvv(c.getCvv())
                .build();
    }

    private static CardDtoBuilder baseBuilder(Card c) {
        return CardDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getFullName())
                .userEmail(c.getUser().getEmail())
                .userPhone(c.getUser().getPhone())
                .type(c.getType())
                .status(c.getStatus())
                .expiryDate(c.getExpiryDate())
                .paymentTransactionHash(c.getPaymentTransactionHash())
                .shippingAddress(c.getShippingAddress())
                .trackingNumber(c.getTrackingNumber())
                .rejectionReason(c.getRejectionReason())
                .primary(c.isPrimary())
                .issuedAt(c.getIssuedAt())
                .activatedAt(c.getActivatedAt())
                .blockedAt(c.getBlockedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt());
    }
}
