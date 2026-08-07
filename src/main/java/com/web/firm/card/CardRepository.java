package com.web.firm.card;

import com.web.firm.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByUserOrderByCreatedAtDesc(User user);

    Optional<Card> findFirstByUserAndPrimaryTrue(User user);

    boolean existsByUserAndStatusIn(User user, List<CardStatus> statuses);

    long countByStatus(CardStatus status);

    /**
     * Paged search by user name/email or card number substring, optionally
     * scoped to a status. Callers must normalize `q` to empty string (never
     * null) — this avoids Hibernate 7 parameter-binding quirks where
     * `:q IS NULL` doesn't evaluate the way you'd expect against Postgres.
     */
    @Query("""
           SELECT c FROM Card c
           JOIN c.user u
           WHERE (:q = ''
                  OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :q, '%'))
                  OR (c.cardNumber IS NOT NULL AND c.cardNumber LIKE CONCAT('%', :q, '%')))
             AND (:status IS NULL OR c.status = :status)
           ORDER BY c.createdAt DESC
           """)
    Page<Card> search(@Param("q") String q, @Param("status") CardStatus status, Pageable pageable);
}
