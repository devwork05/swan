package com.web.firm.deposit;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final DepositService depositService;

    @PostMapping
    public ResponseEntity<DepositDto> createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return ResponseEntity.ok(depositService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<DepositDto>> getDeposits() {
        return ResponseEntity.ok(depositService.listForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepositDto> getDeposit(@PathVariable Long id) {
        return ResponseEntity.ok(depositService.getForCurrentUser(id));
    }
}
