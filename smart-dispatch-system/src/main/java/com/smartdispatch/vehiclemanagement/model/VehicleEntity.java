package com.smartdispatch.vehiclemanagement.model;

import com.smartdispatch.vehiclemanagement.Status;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleEntity {
    private Long id;
    private String type;
    private Status status;
    private Integer capacity;
    private Long operatorId;

}