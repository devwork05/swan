package com.web.firm.admin;

import com.web.firm.plan.DurationParser;
import com.web.firm.plan.IncrementType;
import com.web.firm.plan.InvestmentPlan;
import com.web.firm.plan.InvestmentPlanDto;
import com.web.firm.plan.InvestmentPlanRepository;
import com.web.firm.plan.InvestmentService;
import com.web.firm.plan.UserPlanDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/plans")
@RequiredArgsConstructor
public class AdminPlanController {

    private final InvestmentPlanRepository investmentPlanRepository;
    private final InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<List<InvestmentPlanDto>> list() {
        return ResponseEntity.ok(investmentPlanRepository.findAll().stream()
                .map(InvestmentPlanDto::fromEntity)
                .toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<InvestmentPlanDto> create(@Valid @RequestBody InvestmentPlanDto req) {
        validateDuration(req.getDuration());
        InvestmentPlan p = InvestmentPlan.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(orZero(req.getPrice()))
                .minAmount(req.getMinAmount())
                .maxAmount(req.getMaxAmount())
                .minReturn(orZero(req.getMinReturn()))
                .maxReturn(orZero(req.getMaxReturn()))
                .duration(req.getDuration())
                .incrementInterval(req.getIncrementInterval() != null ? req.getIncrementInterval() : "Daily")
                .incrementType(parseType(req.getIncrementType(), IncrementType.PERCENTAGE))
                .incrementAmount(req.getIncrementAmount() != null ? req.getIncrementAmount() : "1")
                .bonus(orZero(req.getBonus()))
                .referralBonus(orZero(req.getReferralBonus()))
                .returnCapital(req.isReturnCapital())
                .active(req.isActive())
                .build();
        return ResponseEntity.ok(InvestmentPlanDto.fromEntity(investmentPlanRepository.save(p)));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<InvestmentPlanDto> update(@PathVariable Long id, @RequestBody InvestmentPlanDto req) {
        InvestmentPlan p = investmentPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        if (req.getName() != null) p.setName(req.getName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getMinAmount() != null) p.setMinAmount(req.getMinAmount());
        if (req.getMaxAmount() != null) p.setMaxAmount(req.getMaxAmount());
        if (req.getMinReturn() != null) p.setMinReturn(req.getMinReturn());
        if (req.getMaxReturn() != null) p.setMaxReturn(req.getMaxReturn());
        if (req.getDuration() != null) {
            validateDuration(req.getDuration());
            p.setDuration(req.getDuration());
        }
        if (req.getIncrementInterval() != null) p.setIncrementInterval(req.getIncrementInterval());
        if (req.getIncrementType() != null) p.setIncrementType(parseType(req.getIncrementType(), p.getIncrementType()));
        if (req.getIncrementAmount() != null) p.setIncrementAmount(req.getIncrementAmount());
        if (req.getBonus() != null) p.setBonus(req.getBonus());
        if (req.getReferralBonus() != null) p.setReferralBonus(req.getReferralBonus());
        p.setReturnCapital(req.isReturnCapital());
        p.setActive(req.isActive());
        return ResponseEntity.ok(InvestmentPlanDto.fromEntity(investmentPlanRepository.save(p)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        investmentPlanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<UserPlanDto>> listAllUserPlans() {
        return ResponseEntity.ok(investmentService.listAll());
    }

    private static BigDecimal orZero(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static IncrementType parseType(String v, IncrementType fallback) {
        try {
            return v == null ? fallback : IncrementType.valueOf(v);
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    /** Round-trip parse so we surface a 400 for bad duration strings early. */
    private static void validateDuration(String duration) {
        DurationParser.addTo(LocalDateTime.now(), duration);
    }
}
