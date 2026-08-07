package com.web.firm.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final long SINGLETON_ID = 1L;
    private final PlatformSettingRepository repository;

    @Transactional
    public PlatformSetting get() {
        return repository.findById(SINGLETON_ID).orElseGet(() ->
                repository.save(PlatformSetting.builder()
                        .id(SINGLETON_ID)
                        .companyName("Swan Trade Capital")
                        .contactEmail("support@swantradecapital.com")
                        .timezone("UTC")
                        .withdrawEnabled(true)
                        .transferEnabled(false)
                        .minDeposit(new BigDecimal("50.00"))
                        .minWithdraw(new BigDecimal("50.00"))
                        .minTransfer(new BigDecimal("10.00"))
                        .transferPercent(BigDecimal.ZERO)
                        .welcomeBonusEnabled(false)
                        .welcomeBonusAmount(BigDecimal.ZERO)
                        .verifyKyc(false)
                        .kycOnRegistration(false)
                        .kycRequiredForWithdrawal(false)
                        .kycFee(BigDecimal.ZERO)
                        .verifyEmail(false)
                        .build()));
    }

    @Transactional
    public PlatformSetting update(UpdateSettingsRequest req) {
        PlatformSetting s = get();
        if (req.getCompanyName() != null) s.setCompanyName(req.getCompanyName());
        if (req.getContactEmail() != null) s.setContactEmail(req.getContactEmail());
        if (req.getContactPhone() != null) s.setContactPhone(req.getContactPhone());
        if (req.getWhatsappNumber() != null) s.setWhatsappNumber(req.getWhatsappNumber());
        if (req.getAddress() != null) s.setAddress(req.getAddress());
        if (req.getTimezone() != null) s.setTimezone(req.getTimezone());
        if (req.getSiteFaviconUrl() != null) s.setSiteFaviconUrl(req.getSiteFaviconUrl());
        if (req.getSiteDarkLogoUrl() != null) s.setSiteDarkLogoUrl(req.getSiteDarkLogoUrl());
        if (req.getSiteLightLogoUrl() != null) s.setSiteLightLogoUrl(req.getSiteLightLogoUrl());
        if (req.getWithdrawEnabled() != null) s.setWithdrawEnabled(req.getWithdrawEnabled());
        if (req.getTransferEnabled() != null) s.setTransferEnabled(req.getTransferEnabled());
        if (req.getMinDeposit() != null) s.setMinDeposit(req.getMinDeposit());
        if (req.getMinWithdraw() != null) s.setMinWithdraw(req.getMinWithdraw());
        if (req.getMinTransfer() != null) s.setMinTransfer(req.getMinTransfer());
        if (req.getTransferPercent() != null) s.setTransferPercent(req.getTransferPercent());
        if (req.getWelcomeBonusEnabled() != null) s.setWelcomeBonusEnabled(req.getWelcomeBonusEnabled());
        if (req.getWelcomeBonusAmount() != null) s.setWelcomeBonusAmount(req.getWelcomeBonusAmount());
        if (req.getVerifyKyc() != null) s.setVerifyKyc(req.getVerifyKyc());
        if (req.getKycOnRegistration() != null) s.setKycOnRegistration(req.getKycOnRegistration());
        if (req.getKycRequiredForWithdrawal() != null) s.setKycRequiredForWithdrawal(req.getKycRequiredForWithdrawal());
        if (req.getKycFee() != null) s.setKycFee(req.getKycFee());
        if (req.getVerifyEmail() != null) s.setVerifyEmail(req.getVerifyEmail());

        if (req.getMailHost() != null) s.setMailHost(req.getMailHost());
        if (req.getMailPort() != null) s.setMailPort(req.getMailPort());
        if (req.getMailUsername() != null) s.setMailUsername(req.getMailUsername());
        if (req.getMailPassword() != null) s.setMailPassword(req.getMailPassword());
        if (req.getMailEncryption() != null) s.setMailEncryption(req.getMailEncryption());
        if (req.getMailFromAddress() != null) s.setMailFromAddress(req.getMailFromAddress());
        if (req.getMailFromName() != null) s.setMailFromName(req.getMailFromName());

        if (req.getCloudinaryCloudName() != null) s.setCloudinaryCloudName(req.getCloudinaryCloudName());
        if (req.getCloudinaryApiKey() != null) s.setCloudinaryApiKey(req.getCloudinaryApiKey());
        if (req.getCloudinaryApiSecret() != null) s.setCloudinaryApiSecret(req.getCloudinaryApiSecret());

        if (req.getLiveChatScript() != null) s.setLiveChatScript(req.getLiveChatScript());

        if (req.getEnableCardFeature() != null) s.setEnableCardFeature(req.getEnableCardFeature());
        if (req.getVirtualCardFee() != null) s.setVirtualCardFee(req.getVirtualCardFee());
        if (req.getPhysicalCardFee() != null) s.setPhysicalCardFee(req.getPhysicalCardFee());
        if (req.getCardPaymentAddress() != null) s.setCardPaymentAddress(req.getCardPaymentAddress());

        return repository.save(s);
    }
}
