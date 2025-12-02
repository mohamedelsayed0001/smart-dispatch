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
public class Vehicle {
    private Integer id;
    private String type;
    private String status;
    private Integer capacity;
    private Integer operatorId;
    private Double currentLatitude;
    private Double currentLongitude;

}
