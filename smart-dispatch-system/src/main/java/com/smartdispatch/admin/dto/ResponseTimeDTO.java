package com.smartdispatch.admin.dto;

import com.smartdispatch.model.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ResponseTimeDTO {
    private Integer totalAccidents;
    private Double AvgResponseTime;
    private Double minResponseTime;
    private Double maxResponseTime;
    private VehicleType type;

}
