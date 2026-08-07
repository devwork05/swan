package com.web.firm.session;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByJti(String jti);

    List<UserSession> findByUserOrderByLastActiveDesc(User user);

    void deleteByJti(String jti);

    void deleteByUserAndJtiNot(User user, String jti);

    void deleteByUser(User user);
}
