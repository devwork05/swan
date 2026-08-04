package com.web.firm.deposit;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, Long> {
    List<Deposit> findByUserOrderByCreatedAtDesc(User user);

    Optional<Deposit> findByIdAndUser(Long id, User user);

    List<Deposit> findAllByOrderByCreatedAtDesc();

    long countByStatus(DepositStatus status);
}
