package com.web.firm.bot;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BotAllocationRepository extends JpaRepository<BotAllocation, Long> {
    List<BotAllocation> findByUserOrderByCreatedAtDesc(User user);
    List<BotAllocation> findByBotOrderByCreatedAtDesc(TradingBot bot);
    void deleteByBot(TradingBot bot);
}
