package com.web.firm.plan;

import com.web.firm.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investment_plan_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private InvestmentPlan investmentPlan;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserPlanStatus status = UserPlanStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime endsAt;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal expectedReturn;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal accruedProfit = BigDecimal.ZERO;

    @Column
    private LocalDateTime lastAccruedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
