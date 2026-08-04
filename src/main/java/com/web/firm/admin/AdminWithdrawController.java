package com.web.firm.admin;

import com.web.firm.withdraw.WithdrawDto;
import com.web.firm.withdraw.WithdrawService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/withdrawals")
@RequiredArgsConstructor
public class AdminWithdrawController {

    private final WithdrawService withdrawService;

    @GetMapping
    public ResponseEntity<List<WithdrawDto>> listAll() {
        return ResponseEntity.ok(withdrawService.listAll());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<WithdrawDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(withdrawService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<WithdrawDto> reject(@PathVariable Long id, @RequestBody(required = false) RejectRequest req) {
        String reason = req != null ? req.getReason() : null;
        return ResponseEntity.ok(withdrawService.reject(id, reason));
    }
}
