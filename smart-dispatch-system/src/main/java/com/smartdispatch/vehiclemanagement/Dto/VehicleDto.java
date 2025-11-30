package com.smartdispatch.vehiclemanagement.Dto;

import com.smartdispatch.vehiclemanagement.Enum.Status;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class VehicleDto {
    private Long id;
    private String type;
    private Status status;
    private Integer capacity;
    private Long operatorId;

}