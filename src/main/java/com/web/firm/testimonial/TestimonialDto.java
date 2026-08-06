package com.web.firm.testimonial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialDto {

    private Long id;
    private String name;
    private String role;
    private String avatarUrl;
    private String username;
    private String quote;
    private Integer rating;
    private Integer displayOrder;
    private boolean published;
    private Instant createdAt;
    private Instant updatedAt;

    public static TestimonialDto fromEntity(Testimonial t) {
        return TestimonialDto.builder()
                .id(t.getId())
                .name(t.getName())
                .role(t.getRole())
                .avatarUrl(t.getAvatarUrl())
                .username(t.getUsername())
                .quote(t.getQuote())
                .rating(t.getRating())
                .displayOrder(t.getDisplayOrder())
                .published(t.isPublished())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
