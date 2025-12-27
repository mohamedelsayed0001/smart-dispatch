package com.smartdispatch.dispatcher.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VehicleDto {
    private Long id;
    private String type;
    private String status;
    private Integer capacity;
    private Long operatorId;
    private Double currentLatitude;
    private Double currentLongitude;

}
