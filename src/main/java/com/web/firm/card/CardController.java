package com.web.firm.card;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** User-facing card endpoints. All require authentication. */
@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @GetMapping
    public ResponseEntity<List<CardDto>> mine() {
        return ResponseEntity.ok(cardService.listMine().stream().map(CardDto::forOwner).toList());
    }

    @PostMapping
    public ResponseEntity<CardDto> request(@Valid @RequestBody RequestCardBody body) {
        Card c = cardService.requestCard(body.getType(), body.getShippingAddress());
        return ResponseEntity.ok(CardDto.forOwner(c));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<CardDto> submitPayment(
            @PathVariable Long id,
            @Valid @RequestBody SubmitPaymentBody body) {
        Card c = cardService.submitPayment(id, body.getTransactionHash());
        return ResponseEntity.ok(CardDto.forOwner(c));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<CardDto> activate(
            @PathVariable Long id,
            @Valid @RequestBody ActivateBody body) {
        Card c = cardService.activate(id, body.getPin());
        return ResponseEntity.ok(CardDto.forOwner(c));
    }

    /* ---------- request bodies ---------- */

    @Data
    public static class RequestCardBody {
        private CardType type;
        private String shippingAddress;
        private boolean termsAccepted;
    }

    @Data
    public static class SubmitPaymentBody {
        @NotBlank
        private String transactionHash;
    }

    @Data
    public static class ActivateBody {
        @NotBlank
        @Pattern(regexp = "\\d{4}", message = "PIN must be exactly 4 digits")
        private String pin;
    }
}
