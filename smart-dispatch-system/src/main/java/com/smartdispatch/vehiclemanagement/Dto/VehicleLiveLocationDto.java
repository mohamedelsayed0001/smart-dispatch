package com.smartdispatch.vehiclemanagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class VehicleLiveLocationDto {
    private Integer vehicleId;
    private double latitude;
    private double longitude;
}


