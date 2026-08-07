package com.web.firm.card;

import com.web.firm.auth.MailService;
import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsService settingsService;
    private final MailService mailService;

    private final SecureRandom random = new SecureRandom();

    /* ---------- helpers ---------- */

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public void requireCardFeatureEnabled() {
        if (!settingsService.get().isEnableCardFeature()) {
            throw new IllegalStateException("The card feature is currently disabled.");
        }
    }

    /* ---------- user actions ---------- */

    @Transactional
    public Card requestCard(CardType type, String shippingAddress) {
        requireCardFeatureEnabled();
        User user = currentUser();
        if (type == CardType.PHYSICAL && (shippingAddress == null || shippingAddress.isBlank())) {
            throw new IllegalArgumentException("A shipping address is required for physical cards.");
        }
        Card c = Card.builder()
                .user(user)
                .type(type)
                .status(CardStatus.PENDING_PAYMENT)
                .shippingAddress(shippingAddress)
                .build();
        return cardRepository.save(c);
    }

    @Transactional
    public Card submitPayment(Long cardId, String transactionHash) {
        User user = currentUser();
        Card c = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        if (!c.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You cannot modify this card");
        }
        if (c.getStatus() != CardStatus.PENDING_PAYMENT && c.getStatus() != CardStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("This card is not awaiting payment.");
        }
        if (transactionHash == null || transactionHash.isBlank()) {
            throw new IllegalArgumentException("Transaction hash is required.");
        }
        c.setPaymentTransactionHash(transactionHash.trim());
        c.setStatus(CardStatus.PAYMENT_PENDING);
        return cardRepository.save(c);
    }

    @Transactional
    public Card activate(Long cardId, String pin) {
        User user = currentUser();
        Card c = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        if (!c.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You cannot modify this card");
        }
        if (c.getStatus() != CardStatus.ISSUED) {
            throw new IllegalStateException("This card is not ready for activation.");
        }
        if (c.getPin() == null) {
            throw new IllegalStateException("No PIN has been set for this card. Contact support.");
        }
        if (pin == null || !pin.matches("\\d{4}")) {
            throw new IllegalArgumentException("Enter a valid 4-digit PIN.");
        }
        if (!passwordEncoder.matches(pin, c.getPin())) {
            throw new IllegalArgumentException("Incorrect PIN.");
        }
        c.setStatus(CardStatus.ACTIVATED);
        c.setActivatedAt(Instant.now());
        // Promote this card to primary; demote any others for the same user.
        List<Card> others = cardRepository.findByUserOrderByCreatedAtDesc(user);
        for (Card o : others) {
            if (!o.getId().equals(c.getId()) && o.isPrimary()) {
                o.setPrimary(false);
                cardRepository.save(o);
            }
        }
        c.setPrimary(true);
        return cardRepository.save(c);
    }

    public List<Card> listMine() {
        return cardRepository.findByUserOrderByCreatedAtDesc(currentUser());
    }

    /* ---------- admin actions ---------- */

    @Transactional
    public Card confirmPayment(Long cardId) {
        Card c = mustFind(cardId);
        if (c.getStatus() != CardStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Card is not pending payment confirmation.");
        }
        c.setStatus(CardStatus.UNDER_REVIEW);
        return cardRepository.save(c);
    }

    /**
     * Approve. For virtual cards: card details are generated and status jumps
     * straight to ISSUED (nothing to ship). For physical cards: status stays
     * APPROVED until an admin marks it as issued (`issue`).
     */
    @Transactional
    public Card approve(Long cardId, String adminNotes) {
        Card c = mustFind(cardId);
        if (c.getStatus() != CardStatus.UNDER_REVIEW && c.getStatus() != CardStatus.PAYMENT_PENDING) {
            throw new IllegalStateException("Card must be under review to approve.");
        }
        c.setAdminNotes(adminNotes);
        c.setRejectionReason(null);

        String plainPin = generateCardDetails(c);

        if (c.getType() == CardType.VIRTUAL) {
            c.setStatus(CardStatus.ISSUED);
            c.setIssuedAt(Instant.now());
        } else {
            c.setStatus(CardStatus.APPROVED);
        }

        cardRepository.save(c);
        emailApproval(c, plainPin);
        return c;
    }

    @Transactional
    public Card reject(Long cardId, String reason) {
        Card c = mustFind(cardId);
        if (c.getStatus() == CardStatus.ACTIVATED || c.getStatus() == CardStatus.BLOCKED) {
            throw new IllegalStateException("Cannot reject an already-activated card.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }
        c.setStatus(CardStatus.REJECTED);
        c.setRejectionReason(reason.trim());
        cardRepository.save(c);
        emailRejection(c);
        return c;
    }

    @Transactional
    public Card issue(Long cardId, String trackingNumber) {
        Card c = mustFind(cardId);
        if (c.getType() != CardType.PHYSICAL) {
            throw new IllegalStateException("Only physical cards can be issued via this action.");
        }
        if (c.getStatus() != CardStatus.APPROVED) {
            throw new IllegalStateException("Card must be approved before it can be shipped.");
        }
        c.setStatus(CardStatus.ISSUED);
        c.setIssuedAt(Instant.now());
        if (trackingNumber != null && !trackingNumber.isBlank()) {
            c.setTrackingNumber(trackingNumber.trim());
        }
        return cardRepository.save(c);
    }

    @Transactional
    public Card update(Long cardId, CardStatus status, String shippingAddress, String trackingNumber) {
        Card c = mustFind(cardId);
        if (status != null) c.setStatus(status);
        if (shippingAddress != null) c.setShippingAddress(shippingAddress);
        if (trackingNumber != null) c.setTrackingNumber(trackingNumber);
        return cardRepository.save(c);
    }

    @Transactional
    public void delete(Long cardId) {
        cardRepository.deleteById(cardId);
    }

    private Card mustFind(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
    }

    /* ---------- private helpers ---------- */

    /** Populates cardNumber / cvv / pin / expiryDate. Returns the plaintext PIN so we can email it. */
    private String generateCardDetails(Card c) {
        if (c.getCardNumber() == null) {
            c.setCardNumber(randomDigits(16));
        }
        if (c.getCvv() == null) {
            c.setCvv(randomDigits(3));
        }
        String plainPin = randomDigits(4);
        c.setPin(passwordEncoder.encode(plainPin));
        if (c.getExpiryDate() == null) {
            c.setExpiryDate(Instant.now().plus(365 * 4L, ChronoUnit.DAYS));
        }
        return plainPin;
    }

    private String randomDigits(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) sb.append(random.nextInt(10));
        return sb.toString();
    }

    private void emailApproval(Card c, String plainPin) {
        if (!mailService.isConfigured()) return;
        PlatformSetting cfg = settingsService.get();
        String brand = cfg.getCompanyName() == null ? "your account" : cfg.getCompanyName();
        String subject = "Your " + brand + " " + c.getType().name().toLowerCase() + " card is approved";
        String maskedPan = "**** **** **** " + c.getCardNumber().substring(Math.max(0, c.getCardNumber().length() - 4));
        String notes = c.getAdminNotes() == null || c.getAdminNotes().isBlank()
                ? ""
                : "<p style=\"margin:12px 0 0;font-size:13px;color:#475467;\"><b>Note from admin:</b> " + escapeHtml(c.getAdminNotes()) + "</p>";
        String html = "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;background:#f4f6fb;padding:24px;\">"
                + "<div style=\"max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;\">"
                + "<h2 style=\"margin:0;color:#0f172a;\">Your card is ready</h2>"
                + "<p style=\"font-size:14px;color:#475467;\">Hi " + escapeHtml(c.getUser().getFullName()) + ", your "
                + c.getType().name().toLowerCase() + " card has been approved.</p>"
                + "<p style=\"font-family:monospace;background:#f1f5f9;padding:12px;border-radius:8px;\">"
                + maskedPan + "</p>"
                + "<p style=\"font-size:14px;color:#475467;\">Your activation PIN is:</p>"
                + "<p style=\"font-family:monospace;background:#f1f5f9;padding:12px;border-radius:8px;font-size:22px;letter-spacing:6px;text-align:center;\">"
                + plainPin + "</p>"
                + "<p style=\"font-size:13px;color:#64748b;\">Enter this PIN in the Cards section of your dashboard to activate your card.</p>"
                + notes
                + "</div></body></html>";
        mailService.sendHtml(c.getUser().getEmail(), subject, html);
    }

    private void emailRejection(Card c) {
        if (!mailService.isConfigured()) return;
        PlatformSetting cfg = settingsService.get();
        String brand = cfg.getCompanyName() == null ? "your account" : cfg.getCompanyName();
        String subject = "Your " + brand + " card application was declined";
        String html = "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;background:#f4f6fb;padding:24px;\">"
                + "<div style=\"max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;\">"
                + "<h2 style=\"margin:0;color:#0f172a;\">Card application update</h2>"
                + "<p style=\"font-size:14px;color:#475467;\">Hi " + escapeHtml(c.getUser().getFullName()) + ", unfortunately we were unable to approve your card application.</p>"
                + "<p style=\"font-size:14px;color:#475467;\"><b>Reason:</b> " + escapeHtml(c.getRejectionReason()) + "</p>"
                + "<p style=\"font-size:13px;color:#64748b;\">Reach out to support if you'd like to reapply.</p>"
                + "</div></body></html>";
        mailService.sendHtml(c.getUser().getEmail(), subject, html);
    }

    private static String escapeHtml(String v) {
        if (v == null) return "";
        return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
