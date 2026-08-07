package com.web.firm.admin;

import com.web.firm.card.Card;
import com.web.firm.card.CardDto;
import com.web.firm.card.CardRepository;
import com.web.firm.card.CardService;
import com.web.firm.card.CardStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/cards")
@RequiredArgsConstructor
public class AdminCardController {

    private final CardService cardService;
    private final CardRepository cardRepository;

    @GetMapping
    public ResponseEntity<PagedCards> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        CardStatus st = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            try {
                st = CardStatus.valueOf(status);
            } catch (IllegalArgumentException ignored) {
                // treat unknown values as "no filter"
            }
        }
        // Normalize search to empty string so the JPQL parameter is never null —
        // Hibernate 7 does not consistently evaluate `:q IS NULL` against Postgres.
        String q = search == null ? "" : search.trim();
        Pageable pageable = PageRequest.of(page, size);
        Page<Card> result = cardRepository.search(q, st, pageable);
        return ResponseEntity.ok(PagedCards.builder()
                .content(result.getContent().stream().map(CardDto::forAdmin).toList())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .page(result.getNumber())
                .size(result.getSize())
                .build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(Map.of(
                "totalCards", cardRepository.count(),
                "underReview", cardRepository.countByStatus(CardStatus.UNDER_REVIEW),
                "activated", cardRepository.countByStatus(CardStatus.ACTIVATED),
                "rejected", cardRepository.countByStatus(CardStatus.REJECTED),
                "pendingPayment", cardRepository.countByStatus(CardStatus.PENDING_PAYMENT),
                "paymentPending", cardRepository.countByStatus(CardStatus.PAYMENT_PENDING),
                "approved", cardRepository.countByStatus(CardStatus.APPROVED),
                "issued", cardRepository.countByStatus(CardStatus.ISSUED)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDto> get(@PathVariable Long id) {
        Card c = cardRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Card not found"));
        return ResponseEntity.ok(CardDto.forAdmin(c));
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<CardDto> confirmPayment(@PathVariable Long id) {
        return ResponseEntity.ok(CardDto.forAdmin(cardService.confirmPayment(id)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<CardDto> approve(@PathVariable Long id, @RequestBody(required = false) ApproveBody body) {
        String notes = body == null ? null : body.getNotes();
        return ResponseEntity.ok(CardDto.forAdmin(cardService.approve(id, notes)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CardDto> reject(@PathVariable Long id, @RequestBody RejectBody body) {
        return ResponseEntity.ok(CardDto.forAdmin(cardService.reject(id, body.getRejectionReason())));
    }

    @PostMapping("/{id}/issue")
    public ResponseEntity<CardDto> issue(@PathVariable Long id, @RequestBody(required = false) IssueBody body) {
        String tracking = body == null ? null : body.getTrackingNumber();
        return ResponseEntity.ok(CardDto.forAdmin(cardService.issue(id, tracking)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDto> update(@PathVariable Long id, @RequestBody UpdateBody body) {
        return ResponseEntity.ok(CardDto.forAdmin(cardService.update(
                id, body.getStatus(), body.getShippingAddress(), body.getTrackingNumber())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /* ---------- request bodies ---------- */

    @Data
    public static class ApproveBody {
        private String notes;
    }

    @Data
    public static class RejectBody {
        @NotBlank
        private String rejectionReason;
    }

    @Data
    public static class IssueBody {
        private String trackingNumber;
    }

    @Data
    public static class UpdateBody {
        private CardStatus status;
        private String shippingAddress;
        private String trackingNumber;
    }

    @Data
    @Builder
    public static class PagedCards {
        private java.util.List<CardDto> content;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }
}
