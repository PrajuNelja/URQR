package com.nelja.urqr.common.response;

import java.time.Instant;
import java.util.List;

public record ApiError(Instant timestamp, int status, String code, String message,
        String path, String correlationId, List<FieldViolation> fieldErrors) {
    public record FieldViolation(String field, String message) { }
}
