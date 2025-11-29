package com.smartdispatch.smart_dispatch_system.emergency_responder.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IncidentLocationDTO {
  private Integer id;
  private String type;
  private String severity;
  private LocationDTO location;
}