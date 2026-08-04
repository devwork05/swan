package com.web.firm.withdraw;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WithdrawRepository extends JpaRepository<Withdraw, Long> {
    List<Withdraw> findByUserOrderByCreatedAtDesc(User user);

    Optional<Withdraw> findByIdAndUser(Long id, User user);

    List<Withdraw> findAllByOrderByCreatedAtDesc();

    List<Withdraw> findByStatusOrderByCreatedAtDesc(WithdrawStatus status);

    long countByStatus(WithdrawStatus status);
}
