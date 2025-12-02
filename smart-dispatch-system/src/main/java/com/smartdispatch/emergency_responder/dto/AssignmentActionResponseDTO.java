package com.smartdispatch.emergency_responder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentActionResponseDTO {
    private boolean success;
    private String message;
    private AssignmentDTO assignment;
    private IncidentDetailsDTO incident;
    private VehicleDetailsDTO vehicle;
}
