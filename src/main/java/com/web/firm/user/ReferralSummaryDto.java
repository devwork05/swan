package com.web.firm.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralSummaryDto {

    private long totalReferrals;
    private long activeReferrals;
    private BigDecimal totalReferralBonus;
    private String referrerEmail;
    private List<ReferralDto> referrals;
}
