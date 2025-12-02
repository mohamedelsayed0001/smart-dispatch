package com.smartdispatch.vehiclemanagement.rowmapper;

import com.smartdispatch.vehiclemanagement.Dto.VehicleDto;
import com.smartdispatch.vehiclemanagement.model.VehicleEntity;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {
    public VehicleEntity mapFromDto(VehicleDto vehicleDto) {
        return VehicleEntity.builder()
                .type(vehicleDto.getType())
                .capacity(vehicleDto.getCapacity())
                .status(vehicleDto.getStatus())
                .id(vehicleDto.getId())
                .operatorId(vehicleDto.getOperatorId())
                .build();
    }

    public VehicleDto mapToDto(VehicleEntity vehicleEntity) {
        return VehicleDto.builder()
                .type(vehicleEntity.getType())
                .capacity(vehicleEntity.getCapacity())
                .status(vehicleEntity.getStatus())
                .id(vehicleEntity.getId())
                .operatorId(vehicleEntity.getOperatorId())
                .build();
    }

    }
