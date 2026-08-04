package com.web.firm.admin;

import com.web.firm.deposit.DepositDto;
import com.web.firm.deposit.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/deposits")
@RequiredArgsConstructor
public class AdminDepositController {

    private final DepositService depositService;

    @GetMapping
    public ResponseEntity<List<DepositDto>> listAll() {
        return ResponseEntity.ok(depositService.listAll());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<DepositDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(depositService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DepositDto> reject(@PathVariable Long id) {
        return ResponseEntity.ok(depositService.reject(id));
    }
}
