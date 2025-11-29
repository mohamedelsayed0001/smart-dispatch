package com.smartdispatch.smart_dispatch_system.emergency_responder.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
  private Integer id;
  private String type;
  private String level;
  private String description;
  private Double latitude;
  private Double longitude;
  private String status;
  private LocalDateTime timeReported;
  private LocalDateTime timeResolved;
  private Integer citizenId;
}
