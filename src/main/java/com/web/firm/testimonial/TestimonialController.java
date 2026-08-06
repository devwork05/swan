package com.web.firm.testimonial;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public marketing endpoint — anyone can read published testimonials. */
@RestController
@RequestMapping("/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialRepository repository;

    @GetMapping
    public ResponseEntity<List<TestimonialDto>> list() {
        return ResponseEntity.ok(
                repository.findByPublishedTrueOrderByDisplayOrderAscIdAsc().stream()
                        .map(TestimonialDto::fromEntity)
                        .toList());
    }
}
