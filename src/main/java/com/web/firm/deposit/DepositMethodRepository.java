package com.web.firm.deposit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositMethodRepository extends JpaRepository<DepositMethod, Long> {
    Optional<DepositMethod> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);

    List<DepositMethod> findByListedTrue();
}
