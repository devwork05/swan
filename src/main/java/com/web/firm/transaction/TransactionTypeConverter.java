package com.web.firm.transaction;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Stores TransactionType as a plain VARCHAR. Using a converter (rather than
 * {@code @Enumerated(EnumType.STRING)}) prevents Hibernate from emitting a
 * CHECK constraint tied to the current enum members — which breaks whenever
 * we add a new value later and Postgres has already frozen the old list.
 */
@Converter(autoApply = false)
public class TransactionTypeConverter implements AttributeConverter<TransactionType, String> {

    @Override
    public String convertToDatabaseColumn(TransactionType v) {
        return v == null ? null : v.name();
    }

    @Override
    public TransactionType convertToEntityAttribute(String v) {
        if (v == null || v.isBlank()) return null;
        try {
            return TransactionType.valueOf(v);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
