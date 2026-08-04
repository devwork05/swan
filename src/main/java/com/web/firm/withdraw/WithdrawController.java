package com.web.firm.withdraw;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/withdrawals")
@RequiredArgsConstructor
public class WithdrawController {

    private final WithdrawService withdrawService;

    @PostMapping
    public ResponseEntity<WithdrawDto> create(@Valid @RequestBody CreateWithdrawRequest req) {
        return ResponseEntity.ok(withdrawService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<WithdrawDto>> list() {
        return ResponseEntity.ok(withdrawService.listForCurrentUser());
    }
}
