package com.smartdispatch.model;

import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
  private Long id;
  private VehicleType type;
  private VehicleStatus status;
  private Integer capacity;
  private Long operatorId;
}
