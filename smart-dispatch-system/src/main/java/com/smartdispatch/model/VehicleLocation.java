package com.smartdispatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleLocation {
  private Long id;
  private Long vehicleId;
  private Double longitude;
  private Double latitude;
  private LocalDateTime timeStamp;
}
