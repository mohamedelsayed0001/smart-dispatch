package com.smartdispatch.dispatcher.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReassignRequest {
    private Long assignmentId;
    private Long newVehicleId;
    private Long dispatcherId;

}
