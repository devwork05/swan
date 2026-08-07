package com.web.firm.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Subset of settings safe to expose to unauthenticated / non-admin users.
 * Excludes admin/scheduler bookkeeping and any secrets.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicSettingsDto {

    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String whatsappNumber;
    private String address;
    private String siteFaviconUrl;
    private String siteDarkLogoUrl;
    private String siteLightLogoUrl;

    private boolean withdrawEnabled;
    private boolean transferEnabled;
    private BigDecimal minDeposit;
    private BigDecimal minWithdraw;
    private BigDecimal minTransfer;
    private BigDecimal transferPercent;

    private boolean kycRequiredForWithdrawal;

    /** Injected into user-facing pages as-is; admins paste a full <script> from their chat vendor. */
    private String liveChatScript;

    // Card feature (safe to expose so the user page can render fees / payment address).
    private boolean enableCardFeature;
    private BigDecimal virtualCardFee;
    private BigDecimal physicalCardFee;
    private String cardPaymentAddress;

    public static PublicSettingsDto fromEntity(PlatformSetting s) {
        return PublicSettingsDto.builder()
                .companyName(s.getCompanyName())
                .contactEmail(s.getContactEmail())
                .contactPhone(s.getContactPhone())
                .whatsappNumber(s.getWhatsappNumber())
                .address(s.getAddress())
                .siteFaviconUrl(s.getSiteFaviconUrl())
                .siteDarkLogoUrl(s.getSiteDarkLogoUrl())
                .siteLightLogoUrl(s.getSiteLightLogoUrl())
                .withdrawEnabled(s.isWithdrawEnabled())
                .transferEnabled(s.isTransferEnabled())
                .minDeposit(s.getMinDeposit())
                .minWithdraw(s.getMinWithdraw())
                .minTransfer(s.getMinTransfer())
                .transferPercent(s.getTransferPercent())
                .kycRequiredForWithdrawal(s.isKycRequiredForWithdrawal())
                .liveChatScript(s.getLiveChatScript())
                .enableCardFeature(s.isEnableCardFeature())
                .virtualCardFee(s.getVirtualCardFee())
                .physicalCardFee(s.getPhysicalCardFee())
                .cardPaymentAddress(s.getCardPaymentAddress())
                .build();
    }
}
