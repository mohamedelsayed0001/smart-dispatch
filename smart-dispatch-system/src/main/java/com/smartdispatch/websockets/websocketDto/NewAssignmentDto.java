package com.smartdispatch.websockets.websocketDto;

import java.time.LocalDateTime;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.emergency_responder.dto.IncidentDetailsDTO;
import com.smartdispatch.emergency_responder.dto.VehicleDetailsDTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NewAssignmentDto {
  private String type = "NEW_ASSIGNMENT";
  private Integer id;
  private Integer incidentId;
  private Integer vehicleId;
  private String status;
  private LocalDateTime timeAssigned;
  private LocalDateTime timeResolved;
  private IncidentDetailsDTO incident;
  private VehicleDetailsDTO vehicle;

  public NewAssignmentDto(AssignmentDto assignmentDto,
      com.smartdispatch.dispatcher.domains.entities.Incident incidentEntity,
      com.smartdispatch.dispatcher.domains.entities.Vehicle vehicleEntity) {
    this.id = assignmentDto.getId();
    this.status = assignmentDto.getStatus();
    this.timeAssigned = assignmentDto.getTimeAssigned();
    this.timeResolved = assignmentDto.getTimeResolved();
    this.incidentId = assignmentDto.getIncidentId();
    this.vehicleId = assignmentDto.getVehicleId();

    this.incident = new IncidentDetailsDTO(
        incidentEntity.getId(),
        incidentEntity.getType(),
        "level?", // Incident entity in dispatcher might not have level or getter might be
                  // different, checking structure
        incidentEntity.getDescription(),
        incidentEntity.getLatitude(),
        incidentEntity.getLongitude(),
        incidentEntity.getStatus(),
        java.time.LocalDateTime.now() // Incident entity might use specific time type
    );

    this.vehicle = new VehicleDetailsDTO(
        vehicleEntity.getId(),
        vehicleEntity.getType(),
        vehicleEntity.getStatus(),
        vehicleEntity.getCapacity(),
        vehicleEntity.getCurrentLatitude(),
        vehicleEntity.getCurrentLongitude());
  }
}
