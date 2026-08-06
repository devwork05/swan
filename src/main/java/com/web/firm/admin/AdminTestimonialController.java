package com.web.firm.admin;

import com.web.firm.testimonial.Testimonial;
import com.web.firm.testimonial.TestimonialDto;
import com.web.firm.testimonial.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/testimonials")
@RequiredArgsConstructor
public class AdminTestimonialController {

    private final TestimonialRepository repository;

    @GetMapping
    public ResponseEntity<List<TestimonialDto>> list() {
        return ResponseEntity.ok(
                repository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                        .map(TestimonialDto::fromEntity)
                        .toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TestimonialDto> create(@RequestBody TestimonialDto req) {
        Testimonial t = Testimonial.builder()
                .name(req.getName())
                .role(req.getRole())
                .avatarUrl(req.getAvatarUrl())
                .username(req.getUsername())
                .quote(req.getQuote())
                .rating(clampRating(req.getRating(), 5))
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .published(req.isPublished())
                .build();
        return ResponseEntity.ok(TestimonialDto.fromEntity(repository.save(t)));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<TestimonialDto> update(@PathVariable Long id, @RequestBody TestimonialDto req) {
        Testimonial t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Testimonial not found"));
        if (req.getName() != null) t.setName(req.getName());
        if (req.getRole() != null) t.setRole(req.getRole());
        if (req.getAvatarUrl() != null) t.setAvatarUrl(req.getAvatarUrl());
        if (req.getUsername() != null) t.setUsername(req.getUsername());
        if (req.getQuote() != null) t.setQuote(req.getQuote());
        if (req.getRating() != null) t.setRating(clampRating(req.getRating(), t.getRating()));
        if (req.getDisplayOrder() != null) t.setDisplayOrder(req.getDisplayOrder());
        t.setPublished(req.isPublished());
        return ResponseEntity.ok(TestimonialDto.fromEntity(repository.save(t)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static Integer clampRating(Integer v, Integer fallback) {
        if (v == null) return fallback;
        if (v < 1) return 1;
        if (v > 5) return 5;
        return v;
    }
}
