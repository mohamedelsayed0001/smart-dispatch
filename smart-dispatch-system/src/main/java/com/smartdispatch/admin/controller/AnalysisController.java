package com.smartdispatch.admin.controller;

import com.smartdispatch.admin.dto.AvgTimeResolved;
import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.admin.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/admin/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {
    @Autowired
    private AnalysisService analysisService;

    @GetMapping("/incident-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public List<IncidentStatsDto> getIncidentStats(
            @RequestParam(value = "limit", required = false, defaultValue = "12") int limit) {
        return analysisService.getIncidentStatsByMonthAndType(limit);
    }
    @GetMapping("/incident-avg-resolved")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AvgTimeResolved> getAvgResolved() {
        return analysisService.getAvgTimeResolved();
    }
}