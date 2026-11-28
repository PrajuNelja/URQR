package com.nelja.urqr.common.exception;

import com.nelja.urqr.common.response.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.DateTimeException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log=LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        var violations = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiError.FieldViolation(error.getField(), error.getDefaultMessage()))
                .toList();
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed", violations, request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String message = status.is4xxClientError() ? exception.getReason() : "Request failed";
        return response(status, status.name(), message, List.of(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(DataIntegrityViolationException exception,HttpServletRequest request){
        return response(HttpStatus.CONFLICT,"CONFLICT","The request conflicts with existing data",List.of(),request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException exception,HttpServletRequest request){
        return response(HttpStatus.BAD_REQUEST,"INVALID_JSON","Request body is invalid",List.of(),request);
    }

    @ExceptionHandler({ServletRequestBindingException.class,MethodArgumentTypeMismatchException.class})
    ResponseEntity<ApiError> binding(Exception exception,HttpServletRequest request){
        return response(HttpStatus.BAD_REQUEST,"INVALID_PARAMETER","A request parameter or header is invalid",List.of(),request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> badRequest(IllegalArgumentException exception,HttpServletRequest request){
        return response(HttpStatus.BAD_REQUEST,"BAD_REQUEST",exception.getMessage(),List.of(),request);
    }

    @ExceptionHandler(DateTimeException.class)
    ResponseEntity<ApiError> invalidDateTime(DateTimeException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "INVALID_DATE_TIME",
                "A date, time, or timezone value is invalid", List.of(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> forbidden(AccessDeniedException exception, HttpServletRequest request) {
        return response(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action",
                List.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Unexpected request failure correlationId={}",
                request.getAttribute(RequestIdFilter.ATTRIBUTE), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred", List.of(), request);
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String code, String message,
            List<ApiError.FieldViolation> violations, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(RequestIdFilter.ATTRIBUTE);
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), code,
                message, request.getRequestURI(), requestId, violations));
    }
}
