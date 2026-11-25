package com.nelja.urqr.billing.catalog.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** JSON view of a sellable menu product; it contains no persistence entity references. */
public record CatalogProductDto(
        UUID id,
        UUID categoryId,
        String name,
        BigDecimal price,
        boolean available,
        BigDecimal discountPercent,
        BigDecimal cgstRate,
        BigDecimal sgstRate,
        BigDecimal vatRate) { }
