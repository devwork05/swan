package com.web.firm.plan;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    List<UserPlan> findByUserOrderByCreatedAtDesc(User user);

    List<UserPlan> findByStatus(UserPlanStatus status);

    List<UserPlan> findAllByOrderByCreatedAtDesc();

    long countByStatus(UserPlanStatus status);
}
