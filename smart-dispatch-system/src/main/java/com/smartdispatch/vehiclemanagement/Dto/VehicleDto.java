package com.smartdispatch.vehiclemanagement.Dto;

import com.smartdispatch.vehiclemanagement.Enum.Status;
import com.smartdispatch.vehiclemanagement.Enum.Type;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class VehicleDto {
    private Long id;
    private Type type;
    private Status status;
    private Integer capacity;
    private Long operatorId;

}