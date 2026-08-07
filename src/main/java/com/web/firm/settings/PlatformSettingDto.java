package com.web.firm.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingDto {

    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String whatsappNumber;
    private String address;
    private String timezone;

    private String siteFaviconUrl;
    private String siteDarkLogoUrl;
    private String siteLightLogoUrl;

    private boolean withdrawEnabled;
    private boolean transferEnabled;
    private BigDecimal minDeposit;
    private BigDecimal minWithdraw;
    private BigDecimal minTransfer;
    private BigDecimal transferPercent;

    private boolean welcomeBonusEnabled;
    private BigDecimal welcomeBonusAmount;

    private boolean verifyKyc;
    private boolean kycOnRegistration;
    private boolean kycRequiredForWithdrawal;
    private BigDecimal kycFee;

    private boolean verifyEmail;

    private String mailHost;
    private Integer mailPort;
    private String mailUsername;
    private String mailPassword;
    private String mailEncryption;
    private String mailFromAddress;
    private String mailFromName;

    private String cloudinaryCloudName;
    private String cloudinaryApiKey;
    private String cloudinaryApiSecret;

    private String liveChatScript;

    // Card feature
    private boolean enableCardFeature;
    private BigDecimal virtualCardFee;
    private BigDecimal physicalCardFee;
    private String cardPaymentAddress;

    private LocalDateTime lastCron;
    private LocalDateTime updatedAt;

    public static PlatformSettingDto fromEntity(PlatformSetting s) {
        return PlatformSettingDto.builder()
                .companyName(s.getCompanyName())
                .contactEmail(s.getContactEmail())
                .contactPhone(s.getContactPhone())
                .whatsappNumber(s.getWhatsappNumber())
                .address(s.getAddress())
                .timezone(s.getTimezone())
                .siteFaviconUrl(s.getSiteFaviconUrl())
                .siteDarkLogoUrl(s.getSiteDarkLogoUrl())
                .siteLightLogoUrl(s.getSiteLightLogoUrl())
                .withdrawEnabled(s.isWithdrawEnabled())
                .transferEnabled(s.isTransferEnabled())
                .minDeposit(s.getMinDeposit())
                .minWithdraw(s.getMinWithdraw())
                .minTransfer(s.getMinTransfer())
                .transferPercent(s.getTransferPercent())
                .welcomeBonusEnabled(s.isWelcomeBonusEnabled())
                .welcomeBonusAmount(s.getWelcomeBonusAmount())
                .verifyKyc(s.isVerifyKyc())
                .kycOnRegistration(s.isKycOnRegistration())
                .kycRequiredForWithdrawal(s.isKycRequiredForWithdrawal())
                .kycFee(s.getKycFee())
                .verifyEmail(s.isVerifyEmail())
                .mailHost(s.getMailHost())
                .mailPort(s.getMailPort())
                .mailUsername(s.getMailUsername())
                .mailPassword(s.getMailPassword())
                .mailEncryption(s.getMailEncryption())
                .mailFromAddress(s.getMailFromAddress())
                .mailFromName(s.getMailFromName())
                .cloudinaryCloudName(s.getCloudinaryCloudName())
                .cloudinaryApiKey(s.getCloudinaryApiKey())
                .cloudinaryApiSecret(s.getCloudinaryApiSecret())
                .liveChatScript(s.getLiveChatScript())
                .enableCardFeature(s.isEnableCardFeature())
                .virtualCardFee(s.getVirtualCardFee())
                .physicalCardFee(s.getPhysicalCardFee())
                .cardPaymentAddress(s.getCardPaymentAddress())
                .lastCron(s.getLastCron())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
