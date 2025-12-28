package com.smartdispatch.admin.dto;

import com.smartdispatch.model.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnitDto {
    private Long Id;
    private String operatorName;
    private VehicleType type;
    private Double resolutionTime;
}
