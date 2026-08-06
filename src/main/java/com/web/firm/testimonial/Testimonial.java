package com.web.firm.testimonial;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

/**
 * A single investor testimonial rendered on the marketing home page.
 * Sort order is admin-controlled via {@link #displayOrder}; lower = earlier.
 */
@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** e.g. "First-time Investor", "Pro Trader". Free-form. */
    @Column
    private String role;

    /** Optional public URL to the investor's avatar. */
    @Column
    private String avatarUrl;

    /** Optional handle shown at the bottom of the card (e.g. "@jane"). */
    @Column
    private String username;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    /** 1..5. Renders as filled stars on the card. */
    @Column(nullable = false)
    @ColumnDefault("5")
    @Builder.Default
    private Integer rating = 5;

    /** Ascending sort order for the marketing carousel. */
    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer displayOrder = 0;

    /** Hide from the public site without deleting. */
    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean published = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
