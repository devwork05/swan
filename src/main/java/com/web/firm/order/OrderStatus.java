package com.web.firm.order;

/**
 * MARKET orders skip OPEN and jump to FILLED as soon as an admin (or the
 * service on submit) confirms them. LIMIT / STOP_LIMIT sit at OPEN until an
 * admin fills or the user cancels. REJECTED is used by admin for
 * problematic orders (funds, market halt, etc.).
 */
public enum OrderStatus { OPEN, FILLED, CANCELLED, REJECTED }
