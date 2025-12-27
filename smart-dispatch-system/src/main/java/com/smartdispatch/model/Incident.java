package com.smartdispatch.model;

import com.smartdispatch.model.enums.IncidentLevel;
import com.smartdispatch.model.enums.IncidentStatus;
import com.smartdispatch.model.enums.IncidentType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {
  private Long id;
  private IncidentType type;
  private IncidentLevel level;
  private String description;
  private Double latitude;
  private Double longitude;
  private IncidentStatus status;
  private LocalDateTime timeReported;
  private LocalDateTime timeResolved;
  private Long citizenId;
}
