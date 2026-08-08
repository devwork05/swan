package com.web.firm.copytrading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraderTradeRepository extends JpaRepository<TraderTrade, Long> {
    List<TraderTrade> findByTraderOrderByTradedAtDesc(Trader trader);
    void deleteByTrader(Trader trader);
}
