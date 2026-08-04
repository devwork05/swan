package com.web.firm.user;

import com.web.firm.wallet.Wallet;
import com.web.firm.wallet.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @GetMapping
    public ResponseEntity<ReferralSummaryDto> get() {
        User me = currentUser();
        List<ReferralDto> refs = userRepository.findByReferrerIdOrderByCreatedAtDesc(me.getId()).stream()
                .map(ReferralDto::fromEntity)
                .toList();

        String referrerEmail = me.getReferrerId() == null
                ? null
                : userRepository.findById(me.getReferrerId()).map(User::getEmail).orElse(null);

        BigDecimal bonus = walletRepository.findByUserEmail(me.getEmail())
                .map(Wallet::getReferralBonus)
                .orElse(BigDecimal.ZERO);

        return ResponseEntity.ok(ReferralSummaryDto.builder()
                .totalReferrals(refs.size())
                .activeReferrals(refs.stream().filter(ReferralDto::isActive).count())
                .totalReferralBonus(bonus)
                .referrerEmail(referrerEmail)
                .referrals(refs)
                .build());
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
