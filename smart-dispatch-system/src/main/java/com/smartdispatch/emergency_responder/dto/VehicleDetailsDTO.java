package com.smartdispatch.emergency_responder.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDetailsDTO {
  private Integer id;
  private String type;
  private String status;
  private Integer capacity;
  private Double latitude;
  private Double longitude;
}
