package com.web.firm.admin;

import com.web.firm.deposit.DepositMethod;
import com.web.firm.deposit.DepositMethodDto;
import com.web.firm.deposit.DepositMethodRepository;
import com.web.firm.deposit.GatewayCategory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/deposit-methods")
@RequiredArgsConstructor
public class AdminDepositMethodController {

    private final DepositMethodRepository depositMethodRepository;

    @GetMapping
    public ResponseEntity<List<DepositMethodDto>> list() {
        return ResponseEntity.ok(depositMethodRepository.findAll().stream()
                .map(DepositMethodDto::fromEntity)
                .toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DepositMethodDto> create(@Valid @RequestBody DepositMethodDto req) {
        DepositMethod m = DepositMethod.builder()
                .name(req.getName())
                .symbol(req.getSymbol())
                .category(parseCategory(req.getCategory(), GatewayCategory.CRYPTO))
                .network(req.getNetwork())
                .address(req.getAddress())
                .logoUrl(req.getLogoUrl())
                .minAmount(req.getMinAmount())
                .maxAmount(req.getMaxAmount())
                .feePercent(orZero(req.getFeePercent()))
                .processingTime(req.getProcessingTime() != null ? req.getProcessingTime() : "Instant")
                .bankName(req.getBankName())
                .accountName(req.getAccountName())
                .accountNumber(req.getAccountNumber())
                .code(req.getCode())
                .description(req.getDescription())
                .listed(req.isListed())
                .build();
        return ResponseEntity.ok(DepositMethodDto.fromEntity(depositMethodRepository.save(m)));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<DepositMethodDto> update(@PathVariable Long id, @RequestBody DepositMethodDto req) {
        DepositMethod m = depositMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Method not found"));
        if (req.getName() != null) m.setName(req.getName());
        if (req.getSymbol() != null) m.setSymbol(req.getSymbol());
        if (req.getCategory() != null) m.setCategory(parseCategory(req.getCategory(), m.getCategory()));
        if (req.getNetwork() != null) m.setNetwork(req.getNetwork());
        if (req.getAddress() != null) m.setAddress(req.getAddress());
        if (req.getLogoUrl() != null) m.setLogoUrl(req.getLogoUrl());
        if (req.getMinAmount() != null) m.setMinAmount(req.getMinAmount());
        if (req.getMaxAmount() != null) m.setMaxAmount(req.getMaxAmount());
        if (req.getFeePercent() != null) m.setFeePercent(req.getFeePercent());
        if (req.getProcessingTime() != null) m.setProcessingTime(req.getProcessingTime());
        if (req.getBankName() != null) m.setBankName(req.getBankName());
        if (req.getAccountName() != null) m.setAccountName(req.getAccountName());
        if (req.getAccountNumber() != null) m.setAccountNumber(req.getAccountNumber());
        if (req.getCode() != null) m.setCode(req.getCode());
        if (req.getDescription() != null) m.setDescription(req.getDescription());
        m.setListed(req.isListed());
        return ResponseEntity.ok(DepositMethodDto.fromEntity(depositMethodRepository.save(m)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        depositMethodRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static BigDecimal orZero(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static GatewayCategory parseCategory(String v, GatewayCategory fallback) {
        try {
            return v == null ? fallback : GatewayCategory.valueOf(v);
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }
}
