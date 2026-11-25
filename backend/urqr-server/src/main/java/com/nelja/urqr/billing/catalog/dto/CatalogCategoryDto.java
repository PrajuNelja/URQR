package com.nelja.urqr.billing.catalog.dto;

import java.util.UUID;

/** JSON view of a menu category. */
public record CatalogCategoryDto(UUID id, String name, boolean active) { }
