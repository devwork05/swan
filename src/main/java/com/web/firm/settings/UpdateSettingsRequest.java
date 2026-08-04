package com.web.firm.settings;

import lombok.Data;

import java.math.BigDecimal;

/** Every field is optional — only the ones present in the PATCH are applied. */
@Data
public class UpdateSettingsRequest {

    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String whatsappNumber;
    private String address;
    private String timezone;

    private String siteFaviconUrl;
    private String siteDarkLogoUrl;
    private String siteLightLogoUrl;

    private Boolean withdrawEnabled;
    private Boolean transferEnabled;
    private BigDecimal minDeposit;
    private BigDecimal minWithdraw;
    private BigDecimal minTransfer;
    private BigDecimal transferPercent;

    private Boolean welcomeBonusEnabled;
    private BigDecimal welcomeBonusAmount;

    private Boolean verifyKyc;
    private Boolean kycOnRegistration;
    private Boolean kycRequiredForWithdrawal;
    private BigDecimal kycFee;

    private Boolean verifyEmail;

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
}
