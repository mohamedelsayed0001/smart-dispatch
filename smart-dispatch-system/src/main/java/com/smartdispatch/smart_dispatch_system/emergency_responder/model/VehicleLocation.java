package com.smartdispatch.smart_dispatch_system.emergency_responder.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleLocation {
  private Integer id;
  private Integer vehicleId;
  private Double longitude;
  private Double latitude;
  private LocalDateTime timeStamp;
}
