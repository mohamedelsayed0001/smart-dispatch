package com.smartdispatch.websockets.websocketDto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleUpdateDto {
  private Long vehicleId;
  private String newStatus;
  private double latitude;
  private double longitude;
}
