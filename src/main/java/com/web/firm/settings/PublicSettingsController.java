package com.web.firm.settings;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<PublicSettingsDto> get() {
        return ResponseEntity.ok(PublicSettingsDto.fromEntity(settingsService.get()));
    }

    /**
     * Card feature settings for the user card page. Split out from /settings so
     * the reference frontend's `GET /settings/card` path works without changes.
     */
    @GetMapping("/card")
    public ResponseEntity<CardSettingsDto> card() {
        PlatformSetting s = settingsService.get();
        return ResponseEntity.ok(CardSettingsDto.builder()
                .enableCardFeature(s.isEnableCardFeature())
                .virtualCardFee(s.getVirtualCardFee())
                .physicalCardFee(s.getPhysicalCardFee())
                .cardPaymentAddress(s.getCardPaymentAddress())
                .build());
    }

    @Data
    @Builder
    public static class CardSettingsDto {
        private boolean enableCardFeature;
        private BigDecimal virtualCardFee;
        private BigDecimal physicalCardFee;
        private String cardPaymentAddress;
    }
}
