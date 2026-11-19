package com.nelja.urqr.common.exception;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class RequestIdFilter extends OncePerRequestFilter {
    private static final Logger log=LoggerFactory.getLogger(RequestIdFilter.class);
    public static final String ATTRIBUTE = "requestId";
    private static final String HEADER = "X-Correlation-ID";

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String supplied = request.getHeader(HEADER);
        String requestId = supplied != null && supplied.matches("[A-Za-z0-9._-]{1,64}")
                ? supplied : UUID.randomUUID().toString();
        request.setAttribute(ATTRIBUTE, requestId);
        response.setHeader(HEADER, requestId);
        response.setHeader("X-Request-Id",requestId);
        MDC.put(ATTRIBUTE, requestId);
        long started=System.nanoTime();
        try { chain.doFilter(request, response); }
        finally {
            long elapsedMillis=(System.nanoTime()-started)/1_000_000;
            log.info("http_request method={} path={} status={} durationMs={} correlationId={}",request.getMethod(),request.getRequestURI(),response.getStatus(),elapsedMillis,requestId);
            MDC.remove(ATTRIBUTE);
        }
    }
}
