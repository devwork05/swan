package com.web.firm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Drops legacy Postgres CHECK constraints that Hibernate froze against
 * outdated enum members. `ddl-auto: update` never rewrites CHECK constraints,
 * so once a new enum value is added the old constraint rejects inserts even
 * though Hibernate itself is happy.
 *
 * Safe to run every startup — {@code DROP CONSTRAINT IF EXISTS} is a no-op
 * when the constraint has already been removed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ConstraintCleanup implements CommandLineRunner {

    private static final String[] STALE_CONSTRAINTS = {
            "transactions_type_check",
            "transactions_status_check",
    };

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        for (String c : STALE_CONSTRAINTS) {
            try {
                jdbc.execute("ALTER TABLE transactions DROP CONSTRAINT IF EXISTS " + c);
                log.info("Dropped legacy constraint (if present): {}", c);
            } catch (Exception e) {
                // Non-Postgres backends or missing table — either way we don't want to block startup.
                log.warn("Skipping constraint cleanup for {} — {}", c, e.getMessage());
            }
        }
    }
}
