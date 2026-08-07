package com.web.firm.card;

/**
 * State machine for a card application.
 *
 * Happy path:
 *   PENDING_PAYMENT → PAYMENT_PENDING → UNDER_REVIEW → APPROVED
 *     virtual: APPROVED goes straight to ISSUED
 *     physical: APPROVED → ISSUED once admin marks it shipped
 *   ISSUED → ACTIVATED once the user enters their PIN
 * Failure paths: REJECTED (any pre-approval state), BLOCKED (post-activation).
 */
public enum CardStatus {
    PENDING_PAYMENT,
    PAYMENT_PENDING,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    ISSUED,
    ACTIVATED,
    BLOCKED
}
