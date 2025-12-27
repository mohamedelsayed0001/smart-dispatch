package com.smartdispatch.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminIncidentReportDto {
    private Long id;
    private String type;
    private String level;
    private String description;
    private Double latitude;
    private Double longitude;
    private String status;
    private LocalDateTime timeReported;
    private LocalDateTime timeResolved;
    // Name of the user who reported the incident (may be null)
    private String reporterName;
}

