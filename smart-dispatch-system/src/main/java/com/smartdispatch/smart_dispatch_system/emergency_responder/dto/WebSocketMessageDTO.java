package com.smartdispatch.smart_dispatch_system.emergency_responder.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketMessageDTO {
  private String type; // NEW_ASSIGNMENT, ASSIGNMENT_CANCELLED, STATUS_UPDATE
  private Object payload;
  private LocalDateTime timestamp;
}
