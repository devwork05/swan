package com.web.firm.wallet;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletDto> getWallet() {
        return ResponseEntity.ok(walletService.getWalletDto());
    }

    @GetMapping("/summary")
    public ResponseEntity<WalletSummaryDto> getWalletSummary() {
        return ResponseEntity.ok(walletService.getWalletSummary());
    }
}
