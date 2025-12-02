package com.smartdispatch.vehiclemanagement.model;

import com.smartdispatch.vehiclemanagement.Enum.Status;
import com.smartdispatch.vehiclemanagement.Enum.Type;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleEntity {
    private Long id;
    private Type type;
    private Status status;
    private Integer capacity;
    private Long operatorId;

}