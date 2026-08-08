package com.web.firm.copytrading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraderRepository extends JpaRepository<Trader, Long> {
    List<Trader> findByPublishedTrueOrderBySortOrderAscIdAsc();
    List<Trader> findAllByOrderBySortOrderAscIdAsc();
}
