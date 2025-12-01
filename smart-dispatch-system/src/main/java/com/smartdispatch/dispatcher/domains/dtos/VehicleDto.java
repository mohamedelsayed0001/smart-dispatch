package com.smartdispatch.dispatcher.domains.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VehicleDto {
    private Integer id;
    private String type;
    private String status;
    private Integer capacity;
    private Integer operatorId;
    private Double currentLatitude;
    private Double currentLongitude;
}
