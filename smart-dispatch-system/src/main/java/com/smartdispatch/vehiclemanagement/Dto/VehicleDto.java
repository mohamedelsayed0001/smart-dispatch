package com.smartdispatch.vehiclemanagement.Dto;

import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class VehicleDto {
    private Long id;
    private VehicleType type;
    private VehicleStatus status;
    private Integer capacity;
    private Long operatorId;

}