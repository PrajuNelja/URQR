package com.nelja.urqr.analytics;
import com.nelja.urqr.auth.security.CurrentHotel;import io.swagger.v3.oas.annotations.security.SecurityRequirement;import java.time.LocalDate;import org.springframework.format.annotation.DateTimeFormat;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController @RequestMapping("/api/v1/reports")
@SecurityRequirement(name="bearerAuth")
@PreAuthorize("hasRole('MANAGER')")
public class DailySalesController{
    private final DailySalesService service;
    private final CurrentHotel tenant;
    public DailySalesController(DailySalesService s,CurrentHotel t){
        service=s;tenant=t;
    }
    @GetMapping("/daily-sales")
    public DailySalesService.Report report(@AuthenticationPrincipal Jwt jwt,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate date){
        return service.report(tenant.hotelId(jwt),date);
    }}
