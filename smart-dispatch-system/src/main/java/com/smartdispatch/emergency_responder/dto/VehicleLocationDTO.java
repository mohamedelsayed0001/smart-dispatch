package com.smartdispatch.emergency_responder.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleLocationDTO {
  private Integer id;
  private String type;
  private LocationDTO location;
}