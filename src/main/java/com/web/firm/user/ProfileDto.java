package com.web.firm.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Self-view of the current user — richer than {@link UserDto}. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {

    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private String phone;
    private String country;
    private LocalDate dob;
    private String address;
    private String kycStatus;
    private LocalDateTime kycVerifiedAt;
    private boolean kycVerified;
    private boolean twoFaEnabled;
    private boolean hideBalance;
    private boolean withdrawStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProfileDto fromEntity(User u) {
        return ProfileDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole().name())
                .avatarUrl(u.getAvatarUrl())
                .phone(u.getPhone())
                .country(u.getCountry())
                .dob(u.getDob())
                .address(u.getAddress())
                .kycStatus(u.getKycStatus().name())
                .kycVerifiedAt(u.getKycVerifiedAt())
                .kycVerified(u.isKycVerified())
                .twoFaEnabled(u.isTwoFaEnabled())
                .hideBalance(u.isHideBalance())
                .withdrawStatus(u.isWithdrawStatus())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
