package com.web.firm.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Safe subset of another user's data — no wallet or personal info. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralDto {

    private Long id;
    private String fullName;
    private String email;
    private String country;
    private boolean active;
    private String kycStatus;
    private LocalDateTime joinedAt;

    public static ReferralDto fromEntity(User u) {
        return ReferralDto.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .country(u.getCountry())
                .active(!u.isSuspended())
                .kycStatus(u.getKycStatus().name())
                .joinedAt(u.getCreatedAt())
                .build();
    }
}
