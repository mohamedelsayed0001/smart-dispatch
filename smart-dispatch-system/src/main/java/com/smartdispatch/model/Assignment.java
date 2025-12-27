package com.smartdispatch.model;

import com.smartdispatch.model.enums.AssignmentStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {
  private Long id;
  private Long dispatcherId;
  private Long incidentId;
  private Long vehicleId;
  private LocalDateTime timeAssigned;
  private LocalDateTime timeResolved;
  private AssignmentStatus status;
}
