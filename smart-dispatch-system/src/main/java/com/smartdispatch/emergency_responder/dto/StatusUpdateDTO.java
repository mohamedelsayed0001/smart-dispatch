package com.smartdispatch.emergency_responder.dto;

import com.smartdispatch.model.enums.AssignmentStatus;
import com.smartdispatch.model.enums.IncidentStatus;
import com.smartdispatch.model.enums.VehicleStatus;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusUpdateDTO {
  private VehicleStatus vehicleStatus;
  private AssignmentStatus assignmentStatus;
  private IncidentStatus incidentStatus;
}
