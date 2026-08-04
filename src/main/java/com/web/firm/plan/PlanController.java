package com.web.firm.plan;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
public class PlanController {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<List<InvestmentPlanDto>> getAllPlans() {
        List<InvestmentPlanDto> plans = investmentPlanRepository.findByActiveTrue().stream()
                .map(InvestmentPlanDto::fromEntity)
                .toList();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserPlanDto>> getActiveUserPlans() {
        return ResponseEntity.ok(investmentService.listForCurrentUser());
    }

    @PostMapping("/{id}/invest")
    public ResponseEntity<UserPlanDto> invest(@PathVariable Long id, @Valid @RequestBody InvestRequest req) {
        return ResponseEntity.ok(investmentService.invest(id, req));
    }
}
