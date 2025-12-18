package com.smartdispatch.vehiclemanagement.model;

import lombok.*;

import java.sql.Timestamp;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationVehicle {
    private Long id;
    private Long vehicle_id;
    private Double longitude;
    private Double latitude;
    private Timestamp time_stamp;

}
