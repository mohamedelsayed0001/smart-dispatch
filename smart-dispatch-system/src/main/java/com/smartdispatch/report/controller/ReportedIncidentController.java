package com.smartdispatch.report.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartdispatch.report.dto.ReportedIncidentDto;
import com.smartdispatch.report.service.IncidentService;
import com.smartdispatch.security.model.AppUserDetails;

@RestController
@RequestMapping("/api")
public class ReportedIncidentController {

    private static final Logger logger = LoggerFactory.getLogger(ReportedIncidentController.class);

    IncidentService incidentService;

    ReportedIncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }
    
    @PostMapping("/report")
    ResponseEntity<?> newIncident(
        @AuthenticationPrincipal AppUserDetails userDetails,
        @RequestBody ReportedIncidentDto dto
    ){
        boolean flag = incidentService.addIncident(dto, (int)userDetails.getId().longValue(), userDetails.getUsername());
        if (flag)
            return ResponseEntity.status(HttpStatus.OK).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<?> getAllReports(
        @RequestParam(required = false) Integer id,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String level,
        @RequestParam(required = false) String text
    ) {
        try {
            var list = incidentService.getAllIncidents(id, status, type, level, text);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Error fetching reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch reports");
        }
    }
}
