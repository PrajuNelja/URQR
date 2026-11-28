package com.nelja.urqr.billing.catalog.dto;

import java.math.BigDecimal;

/** JSON view of a sellable menu product; it contains no persistence entity references. */
public record CatalogProductDto(
        String id,
        String categoryId,
        String name,
        BigDecimal price,
        boolean available,
        BigDecimal discountPercent,
        BigDecimal cgstRate,
        BigDecimal sgstRate,
        BigDecimal vatRate) { }
