package com.web.firm.order;

import com.web.firm.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeOrderRepository extends JpaRepository<TradeOrder, Long> {

    List<TradeOrder> findByUserOrderByCreatedAtDesc(User user);

    List<TradeOrder> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);

    @Query("""
           SELECT o FROM TradeOrder o
           JOIN o.user u
           WHERE (:q = ''
                  OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :q, '%'))
                  OR UPPER(o.symbol)   LIKE UPPER(CONCAT('%', :q, '%')))
             AND (:status IS NULL OR o.status = :status)
           ORDER BY o.createdAt DESC
           """)
    List<TradeOrder> search(@Param("q") String q, @Param("status") OrderStatus status);
}
