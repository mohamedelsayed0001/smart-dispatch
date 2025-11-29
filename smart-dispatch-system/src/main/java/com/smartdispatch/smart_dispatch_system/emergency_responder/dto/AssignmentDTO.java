package com.smartdispatch.smart_dispatch_system.emergency_responder.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentDTO {
  private Integer id;
  private Integer incidentId;
  private Integer vehicleId;
  private String status;
  private LocalDateTime timeAssigned;
  private LocalDateTime timeResolved;
  private IncidentDetailsDTO incident;
  private VehicleDetailsDTO vehicle;
}
