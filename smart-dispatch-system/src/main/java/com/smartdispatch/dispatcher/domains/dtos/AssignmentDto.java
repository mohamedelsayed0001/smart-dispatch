package com.smartdispatch.dispatcher.domains.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AssignmentDto {
    private String incidentType;
    private Integer id;
    private Integer dispatcherId;
    private Integer incidentId;
    private Integer vehicleId;
    private String description;
    private LocalDateTime timeAssigned;
    private LocalDateTime timeResolved;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;
}
