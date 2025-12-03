package com.smartdispatch.report.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartdispatch.report.dto.ReportedIncidentDto;
import com.smartdispatch.report.service.IncidentService;
import com.smartdispatch.security.model.AppUserDetails;

@RestController
@RequestMapping("/api")
public class ReportedIncidentController {

    IncidentService incidentService;

    ReportedIncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }
    
    @PostMapping("/report")
    ResponseEntity<?> newIncident(
        @AuthenticationPrincipal AppUserDetails userDetails,
        @RequestBody ReportedIncidentDto dto
    ){
        boolean flag = incidentService.addIncident(dto, (int)userDetails.getId().longValue());
        if (flag)
            return ResponseEntity.status(HttpStatus.OK).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
}
