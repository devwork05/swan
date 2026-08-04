package com.web.firm.deposit;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/deposit-methods")
@RequiredArgsConstructor
public class DepositMethodController {

    private final DepositMethodRepository depositMethodRepository;

    @GetMapping
    public ResponseEntity<List<DepositMethodDto>> getAllDepositMethods() {
        List<DepositMethodDto> methods = depositMethodRepository.findByListedTrue().stream()
                .map(DepositMethodDto::fromEntity)
                .toList();
        return ResponseEntity.ok(methods);
    }
}
