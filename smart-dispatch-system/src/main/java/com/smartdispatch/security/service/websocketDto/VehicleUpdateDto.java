package com.smartdispatch.security.service.websocketDto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleUpdateDto {
  private Integer vehicleId;
  private String newStatus;
  private double latitude;
  private double longitude;
}
