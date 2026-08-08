package com.web.firm.bot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradingBotRepository extends JpaRepository<TradingBot, Long> {
    List<TradingBot> findByPublishedTrueOrderBySortOrderAscIdAsc();
    List<TradingBot> findAllByOrderBySortOrderAscIdAsc();
}
