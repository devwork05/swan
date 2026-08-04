package com.web.firm.plan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentPlanRepository extends JpaRepository<InvestmentPlan, Long> {
    List<InvestmentPlan> findByActiveTrue();
}
