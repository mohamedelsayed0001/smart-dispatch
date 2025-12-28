package com.smartdispatch.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminNotificationDto {
    private String type; // INCIDENT_CREATED, INCIDENT_RESOLVED, INCIDENT_UNASSIGNED
    private String message;
    private LocalDateTime time;
    private Long incidentId;
}
