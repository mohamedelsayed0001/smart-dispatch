package com.smartdispatch.dispatcher.domains.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
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
