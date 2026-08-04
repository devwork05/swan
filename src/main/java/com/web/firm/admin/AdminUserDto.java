package com.web.firm.admin;

import com.web.firm.user.User;
import com.web.firm.wallet.Wallet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {

    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String phone;
    private String country;
    private LocalDate dob;
    private String address;
    private Long referrerId;
    private String referrerEmail;
    private long referralCount;
    private boolean withdrawStatus;
    private boolean twoFaEnabled;
    private boolean hideBalance;
    private boolean suspended;
    private String kycStatus;
    private LocalDateTime kycVerifiedAt;
    /** Legacy — true iff kycStatus == VERIFIED. */
    private boolean kycVerified;
    private BigDecimal balance;
    private BigDecimal bonus;
    private BigDecimal referralBonus;
    private BigDecimal totalDeposited;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalProfit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminUserDto from(User u, Wallet w, String referrerEmail, long referralCount) {
        return AdminUserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole().name())
                .phone(u.getPhone())
                .country(u.getCountry())
                .dob(u.getDob())
                .address(u.getAddress())
                .referrerId(u.getReferrerId())
                .referrerEmail(referrerEmail)
                .referralCount(referralCount)
                .withdrawStatus(u.isWithdrawStatus())
                .twoFaEnabled(u.isTwoFaEnabled())
                .hideBalance(u.isHideBalance())
                .suspended(u.isSuspended())
                .kycStatus(u.getKycStatus().name())
                .kycVerifiedAt(u.getKycVerifiedAt())
                .kycVerified(u.isKycVerified())
                .balance(w != null ? w.getBalance() : BigDecimal.ZERO)
                .bonus(w != null ? w.getBonus() : BigDecimal.ZERO)
                .referralBonus(w != null ? w.getReferralBonus() : BigDecimal.ZERO)
                .totalDeposited(w != null ? w.getTotalDeposited() : BigDecimal.ZERO)
                .totalWithdrawn(w != null ? w.getTotalWithdrawn() : BigDecimal.ZERO)
                .totalProfit(w != null ? w.getTotalProfit() : BigDecimal.ZERO)
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
