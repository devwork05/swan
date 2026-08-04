package com.web.firm.plan;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;

/**
 * Maps human-readable increment-interval labels (matching phinance's dropdown)
 * to a concrete {@link Duration} between accrual ticks.
 *
 * <p>Cron-style variants like {@code "Weekly on Monday at 8:00"} are treated as
 * their base cadence ({@code "Weekly"} → 7 days).
 */
public final class IntervalParser {

    /** Table of known labels → tick spacing. */
    private static final Map<String, Duration> TABLE = Map.<String, Duration>ofEntries(
            Map.entry("every 10 minutes", Duration.ofMinutes(10)),
            Map.entry("every 15 minutes", Duration.ofMinutes(15)),
            Map.entry("every 30 minutes", Duration.ofMinutes(30)),
            Map.entry("hourly", Duration.ofHours(1)),
            Map.entry("every 2 hours", Duration.ofHours(2)),
            Map.entry("every 4 hours", Duration.ofHours(4)),
            Map.entry("every 6 hours", Duration.ofHours(6)),
            Map.entry("twice daily", Duration.ofHours(12)),
            Map.entry("daily", Duration.ofDays(1)),
            Map.entry("weekly", Duration.ofDays(7)),
            Map.entry("twice monthly", Duration.ofDays(15)),
            Map.entry("monthly", Duration.ofDays(30)),
            Map.entry("every 6 months", Duration.ofDays(180)),
            Map.entry("quarterly", Duration.ofDays(90)),
            Map.entry("yearly", Duration.ofDays(365))
    );

    private IntervalParser() {}

    public static Duration parse(String label) {
        if (label == null) return Duration.ofDays(1);
        String key = label.toLowerCase(Locale.ROOT).trim();

        // Direct hit
        Duration exact = TABLE.get(key);
        if (exact != null) return exact;

        // Strip cron-style suffix (" on ...", " at ...") to find the base cadence.
        int cut = firstIndexOf(key, " on ", " at ");
        if (cut > 0) {
            Duration base = TABLE.get(key.substring(0, cut));
            if (base != null) return base;
        }

        // Fallback: try prefix match against known labels (e.g. "monthly reports" → monthly).
        for (Map.Entry<String, Duration> e : TABLE.entrySet()) {
            if (key.startsWith(e.getKey())) return e.getValue();
        }

        return Duration.ofDays(1);
    }

    private static int firstIndexOf(String s, String... needles) {
        int best = -1;
        for (String n : needles) {
            int i = s.indexOf(n);
            if (i >= 0 && (best < 0 || i < best)) best = i;
        }
        return best;
    }
}
