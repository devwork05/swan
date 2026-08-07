package com.web.firm.settings;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Singleton row (id=1) holding all runtime configuration that admins can tweak
 * without a redeploy. Access via {@link SettingsService#get()}.
 */
@Entity
@Table(name = "platform_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformSetting {

    @Id
    private Long id;

    // Company / contact
    @Column
    private String companyName;

    @Column
    private String contactEmail;

    @Column
    private String contactPhone;

    @Column
    private String whatsappNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column
    @ColumnDefault("'UTC'")
    @Builder.Default
    private String timezone = "UTC";

    // Site branding
    @Column(length = 500)
    private String siteFaviconUrl;

    @Column(length = 500)
    private String siteDarkLogoUrl;

    @Column(length = 500)
    private String siteLightLogoUrl;

    // Financial toggles / limits
    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean withdrawEnabled = true;

    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean transferEnabled = false;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("50")
    @Builder.Default
    private BigDecimal minDeposit = new BigDecimal("50.00");

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("50")
    @Builder.Default
    private BigDecimal minWithdraw = new BigDecimal("50.00");

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("10")
    @Builder.Default
    private BigDecimal minTransfer = new BigDecimal("10.00");

    @Column(nullable = false, precision = 5, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal transferPercent = BigDecimal.ZERO;

    // Bonus
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean welcomeBonusEnabled = false;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal welcomeBonusAmount = BigDecimal.ZERO;

    // KYC / verification
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean verifyKyc = false;

    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean kycOnRegistration = false;

    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean kycRequiredForWithdrawal = false;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal kycFee = BigDecimal.ZERO;

    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean verifyEmail = false;

    // Email (SMTP)
    @Column
    private String mailHost;

    @Column
    private Integer mailPort;

    @Column
    private String mailUsername;

    @Column(length = 500)
    private String mailPassword;

    /** "tls", "ssl", or empty for none. */
    @Column
    private String mailEncryption;

    @Column
    private String mailFromAddress;

    @Column
    private String mailFromName;

    // Cloudinary (used for logo + payment-proof uploads)
    @Column
    private String cloudinaryCloudName;

    @Column
    private String cloudinaryApiKey;

    @Column(length = 500)
    private String cloudinaryApiSecret;

    /** Whole <script> tag admins paste from Smartsupp, Tawk.to, etc. Injected on user pages. */
    @Column(columnDefinition = "TEXT")
    private String liveChatScript;

    // Card feature
    @Column(nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean enableCardFeature = false;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal virtualCardFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    @ColumnDefault("0")
    @Builder.Default
    private BigDecimal physicalCardFee = BigDecimal.ZERO;

    @Column(length = 200)
    private String cardPaymentAddress;

    // Scheduler bookkeeping
    @Column
    private LocalDateTime lastCron;

    @UpdateTimestamp
    @Column
    private LocalDateTime updatedAt;
}
