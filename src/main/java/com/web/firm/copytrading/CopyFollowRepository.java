package com.web.firm.copytrading;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CopyFollowRepository extends JpaRepository<CopyFollow, Long> {
    List<CopyFollow> findByUserOrderByCreatedAtDesc(User user);
    Optional<CopyFollow> findByUserAndTrader(User user, Trader trader);
    long countByTrader(Trader trader);
    void deleteByTrader(Trader trader);
}
