package com.web.firm.order;

import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeOrderService {

    private final TradeOrderRepository orderRepository;
    private final UserRepository userRepository;

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    @Transactional
    public TradeOrder place(String symbol, OrderSide side, OrderType type,
                            BigDecimal amount, BigDecimal price, BigDecimal stopPrice,
                            String duration) {
        User user = currentUser();
        if (symbol == null || symbol.isBlank()) throw new IllegalArgumentException("Symbol is required");
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException("Amount must be positive");
        if (type != OrderType.MARKET && (price == null || price.signum() <= 0))
            throw new IllegalArgumentException("Price is required for limit / stop-limit orders");
        if (type == OrderType.STOP_LIMIT && (stopPrice == null || stopPrice.signum() <= 0))
            throw new IllegalArgumentException("Stop price is required for stop-limit orders");

        TradeOrder o = TradeOrder.builder()
                .user(user)
                .symbol(symbol.trim().toUpperCase())
                .side(side)
                .type(type)
                .status(type == OrderType.MARKET ? OrderStatus.FILLED : OrderStatus.OPEN)
                .amount(amount)
                .price(price)
                .stopPrice(stopPrice)
                .duration(duration)
                .filledAt(type == OrderType.MARKET ? Instant.now() : null)
                .build();
        return orderRepository.save(o);
    }

    public List<TradeOrder> listMine() {
        return orderRepository.findByUserOrderByCreatedAtDesc(currentUser());
    }

    public List<TradeOrder> listOpenForSymbol(String symbol) {
        return orderRepository.findByUserAndStatusOrderByCreatedAtDesc(currentUser(), OrderStatus.OPEN)
                .stream()
                .filter(o -> symbol == null || symbol.equalsIgnoreCase(o.getSymbol()))
                .toList();
    }

    @Transactional
    public TradeOrder cancel(Long id) {
        User me = currentUser();
        TradeOrder o = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!o.getUser().getId().equals(me.getId()))
            throw new IllegalStateException("You cannot modify this order");
        if (o.getStatus() != OrderStatus.OPEN)
            throw new IllegalStateException("Only open orders can be cancelled");
        o.setStatus(OrderStatus.CANCELLED);
        o.setCancelledAt(Instant.now());
        return orderRepository.save(o);
    }

    /* ---------- admin ---------- */

    @Transactional
    public TradeOrder adminFill(Long id, BigDecimal fillPrice) {
        TradeOrder o = mustFind(id);
        if (o.getStatus() != OrderStatus.OPEN)
            throw new IllegalStateException("Only open orders can be filled");
        if (fillPrice != null && fillPrice.signum() > 0) o.setPrice(fillPrice);
        o.setStatus(OrderStatus.FILLED);
        o.setFilledAt(Instant.now());
        return orderRepository.save(o);
    }

    @Transactional
    public TradeOrder adminReject(Long id, String reason) {
        TradeOrder o = mustFind(id);
        if (o.getStatus() == OrderStatus.FILLED)
            throw new IllegalStateException("Already-filled orders can't be rejected");
        o.setStatus(OrderStatus.REJECTED);
        if (reason != null && !reason.isBlank()) o.setAdminNotes(reason.trim());
        return orderRepository.save(o);
    }

    @Transactional
    public TradeOrder adminUpdate(Long id, String adminNotes, OrderStatus status) {
        TradeOrder o = mustFind(id);
        if (adminNotes != null) o.setAdminNotes(adminNotes);
        if (status != null) o.setStatus(status);
        return orderRepository.save(o);
    }

    @Transactional
    public void adminDelete(Long id) {
        orderRepository.deleteById(id);
    }

    private TradeOrder mustFind(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }
}
