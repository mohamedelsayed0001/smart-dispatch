package com.smartdispatch.smart_dispatch_system.emergency_responder.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusUpdateDTO {
  private String vehicleStatus;
  private String assignmentStatus;
  private LocalDateTime timestamp;
}
