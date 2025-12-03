package com.smartdispatch.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportedIncidentDto {
    private String type;
    private String level;
    private String description;
    private Double latitude;
    private Double longitude;
}
