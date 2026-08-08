package com.web.firm.transaction;

public enum TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    INVESTMENT,
    TRANSFER,
    REFERRAL_BONUS,
    /** Copy-trading fund debit or per-trade profit/loss credit. */
    COPY_TRADING,
    /** Bot-trading per-trade profit/loss credit. */
    BOT_TRADING
}
