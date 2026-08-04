package com.web.firm.config;

import com.web.firm.deposit.DepositMethod;
import com.web.firm.deposit.DepositMethodRepository;
import com.web.firm.deposit.GatewayCategory;
import com.web.firm.plan.IncrementType;
import com.web.firm.user.KycStatus;
import com.web.firm.plan.InvestmentPlan;
import com.web.firm.plan.InvestmentPlanRepository;
import com.web.firm.user.Role;
import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import com.web.firm.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepositMethodRepository depositMethodRepository;
    private final InvestmentPlanRepository investmentPlanRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Override
    public void run(String... args) {
        seedDepositMethods();
        seedInvestmentPlans();
        seedAdminUser();
    }

    private void seedDepositMethods() {
        if (depositMethodRepository.count() > 0) {
            return;
        }

        depositMethodRepository.save(DepositMethod.builder()
                .name("USDT")
                .symbol("USDT")
                .category(GatewayCategory.CRYPTO)
                .network("TRC20")
                .address("TYCMujVAWxAfnMatv7VuEdU9x5kLoGogdy")
                .minAmount(new BigDecimal("50.00"))
                .maxAmount(new BigDecimal("50000.00"))
                .feePercent(BigDecimal.ZERO)
                .processingTime("Instant")
                .listed(true)
                .build());

        depositMethodRepository.save(DepositMethod.builder()
                .name("Bitcoin")
                .symbol("BTC")
                .category(GatewayCategory.CRYPTO)
                .network("BTC")
                .address("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")
                .minAmount(new BigDecimal("50.00"))
                .maxAmount(new BigDecimal("50000.00"))
                .feePercent(BigDecimal.ZERO)
                .processingTime("Instant")
                .listed(true)
                .build());

        depositMethodRepository.save(DepositMethod.builder()
                .name("Ethereum")
                .symbol("ETH")
                .category(GatewayCategory.CRYPTO)
                .network("ERC20")
                .address("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
                .minAmount(new BigDecimal("50.00"))
                .maxAmount(new BigDecimal("50000.00"))
                .feePercent(BigDecimal.ZERO)
                .processingTime("Instant")
                .listed(true)
                .build());

        depositMethodRepository.save(DepositMethod.builder()
                .name("Cardano")
                .symbol("ADA")
                .category(GatewayCategory.CRYPTO)
                .network("ADA")
                .address("addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")
                .minAmount(new BigDecimal("50.00"))
                .maxAmount(new BigDecimal("50000.00"))
                .feePercent(new BigDecimal("4.00"))
                .processingTime("Instant")
                .listed(true)
                .build());
    }

    private void seedInvestmentPlans() {
        if (investmentPlanRepository.count() > 0) {
            return;
        }

        investmentPlanRepository.save(InvestmentPlan.builder()
                .name("Starter Plan")
                .price(new BigDecimal("100.00"))
                .minAmount(new BigDecimal("100.00"))
                .maxAmount(new BigDecimal("999.00"))
                .minReturn(new BigDecimal("3.00"))
                .maxReturn(new BigDecimal("5.00"))
                .duration("7 Days")
                .incrementInterval("Daily")
                .incrementType(IncrementType.PERCENTAGE)
                .incrementAmount("0.5, 0.7, 1.0")
                .bonus(BigDecimal.ZERO)
                .referralBonus(new BigDecimal("5.00"))
                .returnCapital(true)
                .description("Low-risk starter plan with daily returns.")
                .active(true)
                .build());

        investmentPlanRepository.save(InvestmentPlan.builder()
                .name("Pro Plan")
                .price(new BigDecimal("1000.00"))
                .minAmount(new BigDecimal("1000.00"))
                .maxAmount(new BigDecimal("9999.00"))
                .minReturn(new BigDecimal("6.00"))
                .maxReturn(new BigDecimal("8.00"))
                .duration("2 Weeks")
                .incrementInterval("Daily")
                .incrementType(IncrementType.PERCENTAGE)
                .incrementAmount("0.5, 0.6, 0.7, 0.8")
                .bonus(new BigDecimal("25.00"))
                .referralBonus(new BigDecimal("25.00"))
                .returnCapital(true)
                .description("Balanced plan for experienced investors.")
                .active(true)
                .build());

        investmentPlanRepository.save(InvestmentPlan.builder()
                .name("Elite Plan")
                .price(new BigDecimal("10000.00"))
                .minAmount(new BigDecimal("10000.00"))
                .maxAmount(new BigDecimal("100000.00"))
                .minReturn(new BigDecimal("10.00"))
                .maxReturn(new BigDecimal("12.00"))
                .duration("1 Month")
                .incrementInterval("Twice Daily")
                .incrementType(IncrementType.PERCENTAGE)
                .incrementAmount("0.15, 0.2, 0.25")
                .bonus(new BigDecimal("100.00"))
                .referralBonus(new BigDecimal("100.00"))
                .returnCapital(true)
                .description("High-yield plan for serious investors.")
                .active(true)
                .build());
    }

    private void seedAdminUser() {
        String adminEmail = "admin@swantradecapital.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = userRepository.save(User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode("Admin@12345"))
                .fullName("Platform Admin")
                .role(Role.ADMIN)
                .kycStatus(KycStatus.VERIFIED)
                .kycVerifiedAt(java.time.LocalDateTime.now())
                .build());
        walletService.createWallet(admin);
    }
}
