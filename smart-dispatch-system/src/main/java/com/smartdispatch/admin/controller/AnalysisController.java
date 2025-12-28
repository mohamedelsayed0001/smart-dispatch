package com.smartdispatch.admin.controller;

import com.smartdispatch.admin.dto.*;
import com.smartdispatch.admin.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.sql.ClientInfoStatus;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@RestController
@RequestMapping("/api/admin/analysis")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AnalysisController {
    @Autowired
    private AnalysisService analysisService;

    @GetMapping("/incident-stats")
    public List<IncidentStatsDto> getIncidentStats(
            @RequestParam(value = "limit", required = false, defaultValue = "12") int limit) {
        return analysisService.getIncidentStatsByMonthAndType(limit);
    }
    @GetMapping("/incident-avg-resolved")
    public List<AvgTimeResolved> getAvgResolved() {
        return analysisService.getAvgTimeResolved();
    }
    @GetMapping("/vehicle-count")
    public List<VehicleTypeCount> getVehicleCount() {
        return analysisService.getVehicleCountByType();
    }
    @GetMapping("/top-units")
    public ResponseEntity<?> getTopUnits(@RequestParam LocalDateTime startDate,@RequestParam LocalDateTime endDate) throws SQLException {
        List<UnitDto> list=analysisService.getTopUnits(startDate, endDate);
            return ResponseEntity.ok(list);
    }
    @GetMapping("/response-times")
    public ResponseEntity<List<ResponseTimeDTO>> getResponseTimes(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) throws SQLException {

        List<ResponseTimeDTO> responseTimes = analysisService.getResponseTime(startDate, endDate);
        return ResponseEntity.ok(responseTimes);
}
}