package com.web.firm.testimonial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByPublishedTrueOrderByDisplayOrderAscIdAsc();

    List<Testimonial> findAllByOrderByDisplayOrderAscIdAsc();
}
