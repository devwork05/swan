package com.web.firm.plan;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses phinance-style duration strings such as "1 Day", "3 Weeks", "6 Months",
 * "1 Year", "48 Hours" and applies them to a base timestamp.
 *
 * <p>Format: {@code <number> <unit>}. Unit is case-insensitive and can be singular
 * or plural. Recognised units: Minute(s), Hour(s), Day(s), Week(s), Month(s), Year(s).
 */
public final class DurationParser {

    private static final Pattern PATTERN = Pattern.compile(
            "^\\s*(\\d+)\\s+(minute|hour|day|week|month|year)s?\\s*$",
            Pattern.CASE_INSENSITIVE);

    private DurationParser() {}

    public static LocalDateTime addTo(LocalDateTime start, String duration) {
        if (start == null) throw new IllegalArgumentException("start required");
        Parsed p = parse(duration);
        return switch (p.unit) {
            case "minute" -> start.plusMinutes(p.qty);
            case "hour" -> start.plusHours(p.qty);
            case "day" -> start.plusDays(p.qty);
            case "week" -> start.plusWeeks(p.qty);
            case "month" -> start.plusMonths(p.qty);
            case "year" -> start.plusYears(p.qty);
            default -> throw new IllegalStateException();
        };
    }

    private static Parsed parse(String s) {
        if (s == null) throw new IllegalArgumentException("duration required");
        Matcher m = PATTERN.matcher(s);
        if (!m.matches()) {
            throw new IllegalArgumentException("Invalid duration \"" + s + "\". Expected e.g. \"1 Day\", \"6 Months\".");
        }
        return new Parsed(Long.parseLong(m.group(1)), m.group(2).toLowerCase(Locale.ROOT));
    }

    private record Parsed(long qty, String unit) {}
}
