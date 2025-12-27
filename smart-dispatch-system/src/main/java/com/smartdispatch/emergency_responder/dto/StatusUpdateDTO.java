package com.smartdispatch.emergency_responder.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusUpdateDTO {
  private String vehicleStatus;
  private String assignmentStatus;
  private String incidentStatus;
}
