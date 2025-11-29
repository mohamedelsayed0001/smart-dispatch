package com.smartdispatch.smart_dispatch_system.emergency_responder.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
  private Integer id;
  private String type;
  private String status;
  private Integer capacity;
  private Integer operatorId;
}
