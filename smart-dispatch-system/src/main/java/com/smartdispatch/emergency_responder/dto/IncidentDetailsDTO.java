package com.smartdispatch.emergency_responder.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IncidentDetailsDTO {
  private Integer id;
  private String type;
  private String level;
  private String description;
  private Double latitude;
  private Double longitude;
  private String status;
  private LocalDateTime timeReported;
}
