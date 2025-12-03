package com.smartdispatch.emergency_responder.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationsResponseDTO {
  private VehicleLocationDTO vehicle;
  private IncidentLocationDTO incident;
}
