package com.smartdispatch.dispatcher.domains.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Assignment {
    private Integer id;
    private Integer dispatcherId;
    private Integer incidentId;
    private Integer vehicleId;
    private LocalDateTime timeAssigned;
    private LocalDateTime timeResolved;
    private String status;
}
