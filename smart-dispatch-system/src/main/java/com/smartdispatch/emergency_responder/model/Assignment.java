package com.smartdispatch.emergency_responder.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
  private Integer id;
  private Integer dispatcherId;
  private Integer incidentId;
  private Integer vehicleId;
  private LocalDateTime timeAssigned;
  private LocalDateTime timeResolved;
  private String status;
}
