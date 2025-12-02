package com.smartdispatch.dispatcher.domains.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AssignmentRequest {
    Integer incidentId;
    Integer vehicleId;
    Integer dispatcherId;
}
