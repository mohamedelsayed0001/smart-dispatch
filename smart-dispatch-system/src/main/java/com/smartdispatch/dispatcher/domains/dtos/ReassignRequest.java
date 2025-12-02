package com.smartdispatch.dispatcher.domains.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReassignRequest {
    private Integer assignmentId;
    private Integer newVehicleId;
    private Integer dispatcherId;
}
