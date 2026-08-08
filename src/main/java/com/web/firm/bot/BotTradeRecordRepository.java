package com.web.firm.bot;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BotTradeRecordRepository extends JpaRepository<BotTradeRecord, Long> {

    List<BotTradeRecord> findByAllocationOrderByTradedAtDesc(BotAllocation allocation);

    @Query("""
           SELECT r FROM BotTradeRecord r
           WHERE r.allocation.user = :user
           ORDER BY r.tradedAt DESC
           """)
    List<BotTradeRecord> findByUserOrderByTradedAtDesc(@Param("user") User user);

    void deleteByAllocation(BotAllocation allocation);
}
