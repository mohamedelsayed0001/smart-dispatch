package com.smartdispatch.dispatcher.dtos;

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
    private Long id;
    private Long dispatcherId;
    private Long incidentId;
    private Long vehicleId;
    private String description;
    private LocalDateTime timeAssigned;
    private LocalDateTime timeResolved;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;
}
